import { getCurrentUser, unauthorized } from "@/lib/auth";
import { findExisting, loadUserMessage, toResponse } from "@/lib/feedback";
import { callOpenAIJson } from "@/lib/openai";
import { Correction, type CorrectionDoc } from "@/models/Correction";

const CATEGORIES: CorrectionDoc["category"][] = [
  "grammar",
  "vocabulary",
  "spelling",
  "punctuation",
  "naturalness",
  "other",
];

type CorrectResult = {
  hasErrors: boolean;
  correctedText: string;
  category: CorrectionDoc["category"];
  explanation: string;
};

const SYSTEM_PROMPT = `You are an English grammar teacher for a Taiwanese learner.
Check the learner's sentence for grammar, vocabulary, spelling and punctuation mistakes.
Make the smallest changes needed to make it correct; keep the learner's meaning and style.
Do NOT rewrite it to sound fancier — that is a separate feature.
Respond with a JSON object:
{
  "hasErrors": true | false,
  "correctedText": "<the corrected sentence, or the original if it has no errors>",
  "category": "<main mistake type: ${CATEGORIES.join(" | ")}>",
  "explanation": "<用繁體中文簡短說明錯在哪裡、為什麼要這樣改；如果沒有錯，就稱讚並說明哪裡用得好>"
}`;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const loaded = await loadUserMessage(await request.json(), user.id);
  if ("error" in loaded) {
    return Response.json({ error: loaded.error }, { status: loaded.status });
  }

  try {
    const existing = await findExisting(user.id, loaded.messageId, "correction");
    if (existing) return Response.json(toResponse(existing));

    const result = await callOpenAIJson<CorrectResult>(
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            loaded.previousQuestion && `Context (what the other person said): "${loaded.previousQuestion}"`,
            `Learner's sentence: "${loaded.text}"`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      { temperature: 0.2 }
    );

    const saved = await Correction.create({
      userId: user.id,
      conversationId: loaded.conversationId,
      messageId: loaded.messageId,
      kind: "correction",
      category: result.hasErrors && CATEGORIES.includes(result.category) ? result.category : "other",
      originalText: loaded.text,
      correctedText: result.correctedText || loaded.text,
      explanation: result.explanation,
    });

    return Response.json(toResponse(saved));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong, please try again." }, { status: 500 });
  }
}

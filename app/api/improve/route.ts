import { getCurrentUser, unauthorized } from "@/lib/auth";
import { findExisting, loadUserMessage, toResponse } from "@/lib/feedback";
import { callOpenAIJson } from "@/lib/openai";
import { Correction } from "@/models/Correction";

type ImproveResult = {
  improvedText: string;
  explanation: string;
};

const SYSTEM_PROMPT = `You are an English speaking coach for a Taiwanese learner.
Given what the other person said and the learner's reply, write a better, more complete and natural reply
that a fluent speaker would say in this situation. Keep the learner's original meaning and intent,
add useful detail, and use natural everyday expressions. Keep it to 1-3 sentences.
Respond with a JSON object:
{
  "improvedText": "<the better, more complete reply in English>",
  "explanation": "<用繁體中文說明改了哪些地方、為什麼這樣說更好，並列出 1-2 個值得學的片語>"
}`;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const loaded = await loadUserMessage(await request.json(), user.id);
  if ("error" in loaded) {
    return Response.json({ error: loaded.error }, { status: loaded.status });
  }

  try {
    const existing = await findExisting(user.id, loaded.messageId, "suggestion");
    if (existing) return Response.json(toResponse(existing));

    const result = await callOpenAIJson<ImproveResult>([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `Situation: ${loaded.scenarioPersona}`,
          loaded.previousQuestion && `The other person said: "${loaded.previousQuestion}"`,
          `Learner's reply: "${loaded.text}"`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ]);

    const saved = await Correction.create({
      userId: user.id,
      conversationId: loaded.conversationId,
      messageId: loaded.messageId,
      kind: "suggestion",
      category: "naturalness",
      originalText: loaded.text,
      correctedText: result.improvedText,
      explanation: result.explanation,
    });

    return Response.json(toResponse(saved));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong, please try again." }, { status: 500 });
  }
}

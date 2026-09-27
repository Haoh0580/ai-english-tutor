import { isValidObjectId } from "mongoose";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { callOpenAIJson } from "@/lib/openai";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";

type ChatRequest = {
  scenario: string;
  // 第一次呼叫（開場白）不帶；之後帶上一次回傳的 id
  conversationId?: string;
  // 使用者這次輸入的英文；開場時不帶
  message?: string;
};

function buildSystemPrompt(persona: string) {
  return [
    "You are an English conversation partner for a Taiwanese English learner.",
    persona,
    "Stay in character. Use natural, simple-to-intermediate English.",
    "Keep each reply short: 1-3 sentences, and usually end with a question to keep the conversation going.",
    'Always respond with a JSON object: {"reply": "<your reply in English>"}',
  ].join("\n");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = (await request.json()) as ChatRequest;

  const scenario = getScenario(body.scenario);
  if (!scenario) {
    return Response.json({ error: "Unknown scenario" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (body.conversationId && !message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    await connectDB();

    let conversation;
    if (body.conversationId) {
      // 只找自己的對話；別人的 id 一律當作不存在
      conversation = isValidObjectId(body.conversationId)
        ? await Conversation.findOne({ _id: body.conversationId, userId: user.id })
        : null;
      if (!conversation) {
        return Response.json({ error: "Conversation not found" }, { status: 404 });
      }
      conversation.messages.push({ role: "user", content: message! });
    } else {
      conversation = new Conversation({
        userId: user.id,
        title: scenario.label,
        topic: scenario.id,
        messages: [],
      });
    }

    // 剛存進去的使用者訊息 id，前端之後打糾錯 / 建議 API 要用
    const userMessage = body.conversationId ? conversation.messages.at(-1) : undefined;

    const history = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const { reply } = await callOpenAIJson<{ reply: string }>(
      [
        { role: "system", content: buildSystemPrompt(scenario.persona) },
        ...(history.length > 0
          ? history
          : [{ role: "user", content: "(Start the conversation with a short greeting and one opening question.)" }]),
      ],
      { temperature: 0.8 }
    );
    if (typeof reply !== "string") throw new Error("Unexpected OpenAI response");

    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    return Response.json({
      conversationId: conversation._id.toString(),
      userMessageId: (userMessage as { _id?: { toString(): string } } | undefined)?._id?.toString(),
      reply,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong, please try again." }, { status: 500 });
  }
}

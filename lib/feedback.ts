import { isValidObjectId, type HydratedDocument, type Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";
import { Correction, type CorrectionDoc } from "@/models/Correction";

type FeedbackRequest = { conversationId?: string; messageId?: string };

type MessageWithId = { _id: Types.ObjectId; role: string; content: string };

// 從 DB 找出使用者那句話，以及它前面 AI 問的那句（當作上下文）
// 只會找到 userId 自己的對話，拿別人的 id 來查會得到 404
export async function loadUserMessage(body: FeedbackRequest, userId: Types.ObjectId) {
  const { conversationId, messageId } = body;
  if (!isValidObjectId(conversationId) || !isValidObjectId(messageId)) {
    return { error: "conversationId and messageId are required", status: 400 } as const;
  }

  await connectDB();
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) return { error: "Conversation not found", status: 404 } as const;

  const messages = conversation.messages as unknown as MessageWithId[];
  const index = messages.findIndex((m) => m._id.toString() === messageId);
  const message = messages[index];
  if (!message || message.role !== "user") {
    return { error: "User message not found", status: 404 } as const;
  }

  const previousQuestion = messages
    .slice(0, index)
    .findLast((m) => m.role === "assistant")?.content;

  return {
    userId,
    conversationId: conversation._id,
    messageId: message._id,
    text: message.content,
    previousQuestion,
    scenarioPersona: getScenario(conversation.topic ?? "")?.persona ?? conversation.topic ?? "",
  };
}

// 同一句話同一種回饋只算一次，避免重複打 OpenAI
export async function findExisting(
  userId: Types.ObjectId,
  messageId: Types.ObjectId,
  kind: CorrectionDoc["kind"]
) {
  return Correction.findOne({ userId, messageId, kind });
}

export function toResponse(doc: HydratedDocument<CorrectionDoc>) {
  return {
    id: doc._id.toString(),
    kind: doc.kind,
    category: doc.category,
    originalText: doc.originalText,
    correctedText: doc.correctedText,
    explanation: doc.explanation,
  };
}

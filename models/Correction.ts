import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// 每一筆糾錯或建議，對應到某場對話中的某則使用者訊息
const correctionSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // 對應 Conversation.messages 裡那則訊息的 _id
    messageId: { type: Schema.Types.ObjectId, required: true },
    // 這筆紀錄屬於哪個使用者；所有查詢都要帶這個條件
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // correction = 明確錯誤；suggestion = 沒錯但可以更自然
    kind: {
      type: String,
      enum: ["correction", "suggestion"],
      required: true,
    },
    category: {
      type: String,
      enum: ["grammar", "vocabulary", "spelling", "punctuation", "naturalness", "other"],
      default: "other",
    },
    originalText: { type: String, required: true },
    correctedText: { type: String, required: true },
    explanation: { type: String },

    // 使用者是否採用了這筆建議
    applied: { type: Boolean, default: false },
    appliedAt: { type: Date },
  },
  { timestamps: true }
);

export type CorrectionDoc = InferSchemaType<typeof correctionSchema>;

export const Correction: Model<CorrectionDoc> =
  models.Correction || model("Correction", correctionSchema);

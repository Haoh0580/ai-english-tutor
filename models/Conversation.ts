import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// 單則訊息：內嵌在對話裡，一場練習的完整對話存在同一份文件
const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// 一場練習
const conversationSchema = new Schema(
  {
    // 這筆紀錄屬於哪個使用者；所有查詢都要帶這個條件
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New practice" },
    // 練習主題 / 情境，例如 "ordering at a restaurant"
    topic: { type: String },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    messages: { type: [messageSchema], default: [] },
    // 練習結束後的整體回饋
    summary: { type: String },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export type ConversationDoc = InferSchemaType<typeof conversationSchema>;

export const Conversation: Model<ConversationDoc> =
  models.Conversation || model("Conversation", conversationSchema);

import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// 登入 session：cookie 裡放隨機 token，DB 只存它的 SHA-256，DB 外洩也拿不到可用的 token
const sessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  // TTL index：過期後 MongoDB 會自動刪除
  expiresAt: { type: Date, required: true, expires: 0 },
});

export type SessionDoc = InferSchemaType<typeof sessionSchema>;

export const Session: Model<SessionDoc> = models.Session || model("Session", sessionSchema);

import mongoose, { Schema, Document } from 'mongoose';

interface IMessage {
  sender: string;
  text: string;
  timestamp: string;
}

interface IRunAttempt {
  attemptNumber: number;
  blocks: string[];
  success: boolean;
  failReason: string | null;
  timestamp: string;
}

/** โครงสร้างข้อมูลประวัติการสนทนาและการรันบล็อกคำสั่ง (มี TTL Index กำหนดหมดอายุใน 90 วัน) */
export interface IMatchLog extends Document {
  sessionId: mongoose.Types.ObjectId;
  messages: IMessage[];
  runAttempts: IRunAttempt[];
  createdAt: Date;
}

const MatchLogSchema = new Schema<IMatchLog>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true },
  messages: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: String, required: true },
    },
  ],
  runAttempts: [
    {
      attemptNumber: { type: Number, required: true },
      blocks: [{ type: String }],
      success: { type: Boolean, required: true },
      failReason: { type: String, default: null },
      timestamp: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now, expires: '90d' }, // ดัชนี TTL ลบข้อมูลอัตโนมัติเมื่อครบ 90 วัน
});

export const MatchLog = mongoose.model<IMatchLog>('MatchLog', MatchLogSchema);

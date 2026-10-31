import mongoose, { Schema, Document } from 'mongoose';

/** โครงสร้างข้อมูลเซสชันการเล่นเกมแต่ละรอบ บันทึกสถิติและผลการแข่งขัน */
export interface IGameSession extends Document {
  roomCode: string;
  hostId: mongoose.Types.ObjectId;
  joinerId: mongoose.Types.ObjectId;
  mapSeed: string;
  result: 'win' | 'lose';
  failReason?: string;
  timeUsedSeconds: number;
  blocksUsedCount: number;
  blockUsageLog: Record<string, number>;
  chatCharCount: number;
  startedAt: Date;
  endedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>({
  roomCode: { type: String, required: true, index: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  joinerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mapSeed: { type: String, ref: 'Map', required: true },
  result: { type: String, enum: ['win', 'lose'], required: true },
  failReason: { type: String, default: null },
  timeUsedSeconds: { type: Number, required: true },
  blocksUsedCount: { type: Number, required: true },
  blockUsageLog: { type: Schema.Types.Mixed, required: true },
  chatCharCount: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
});

export const GameSession = mongoose.model<IGameSession>('GameSession', GameSessionSchema);

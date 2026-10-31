import mongoose, { Schema, Document } from 'mongoose';

/** โครงสร้างข้อมูลบันทึกประวัติการเปลี่ยนแปลงเหรียญและรางวัล (Audit Log) */
export interface IEconomyLog extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  reason: string;
  referenceId?: string;
  createdAt: Date;
}

const EconomyLogSchema = new Schema<IEconomyLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  reason: { type: String, required: true },
  referenceId: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const EconomyLog = mongoose.model<IEconomyLog>('EconomyLog', EconomyLogSchema);

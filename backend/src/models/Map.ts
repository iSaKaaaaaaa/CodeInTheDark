import mongoose, { Schema, Document } from 'mongoose';

/** โครงสร้างสถิติแผนที่เขาวงกต (จัดเก็บจำนวนครั้งที่เล่นและจำนวนครั้งที่ผ่านด่าน) */
export interface IMap extends Document<string> {
  seed: number;
  timesPlayed: number;
  timesCleared: number;
}

const MapSchema = new Schema<IMap>(
  {
    _id: { type: String, required: true },
    seed: { type: Number, required: true },
    timesPlayed: { type: Number, default: 0 },
    timesCleared: { type: Number, default: 0 },
  },
  { _id: false }
);

export const MapModel = mongoose.model<IMap>('Map', MapSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IMap extends Document {
  _id: string; // The seed as string
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
  { _id: false } // We are explicitly providing _id
);

export const MapModel = mongoose.model<IMap>('Map', MapSchema);

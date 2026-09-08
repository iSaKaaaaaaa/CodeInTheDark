import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  displayName: string; // from Google
  username?: string; // chosen by user
  email: string;
  avatarUrl?: string | null;
  coins: number;
  totalGames: number;
  totalWins: number;
  walletVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, default: null },
    coins: { type: Number, required: true, default: 0 },
    totalGames: { type: Number, required: true, default: 0 },
    totalWins: { type: Number, required: true, default: 0 },
    walletVersion: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

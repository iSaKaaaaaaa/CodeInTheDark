import mongoose from 'mongoose';
import dns from 'dns';

// บังคับ Node.js ใช้ Google DNS เพื่อแก้ปัญหา querySrv ECONNREFUSED บน Windows / เน็ตบ้าน
// ต้องเรียกก่อน mongoose.connect() เสมอ — ห้าม comment ออก
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async (retries = 3) => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in .env file');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoURI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error: any) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('All connection attempts failed. Exiting.');
        process.exit(1);
      }
      // รอ 2 วินาทีก่อน retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

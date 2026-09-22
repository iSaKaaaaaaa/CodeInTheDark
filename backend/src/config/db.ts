import mongoose from 'mongoose';
import dns from 'dns';

// แก้ไขปัญหา Node.js ค้นหา DNS SRV record ล้มเหลว (querySrv ECONNREFUSED) บน Windows / เน็ตบ้าน
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

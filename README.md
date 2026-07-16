# Code in the Dark: Asymmetric Co-op Puzzle Game

ยินดีต้อนรับสู่โปรเจกต์ **Code in the Dark: Asymmetric Co-op Puzzle Game**! ซึ่งเป็นเกมแนวไขปริศนาแบบร่วมมือกันที่ผู้เล่นแต่ละฝ่ายได้รับข้อมูลไม่เท่ากัน ที่พัฒนาด้วย React, Vite, Phaser (สำหรับระบบการเล่น) และ Node.js + Socket.IO สำหรับฝั่งเซิร์ฟเวอร์ระบบเกม

## เทคโนโลยีที่ใช้

- **Frontend**: React (Vite), TypeScript, TailwindCSS, Phaser, Zustand, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Deployment**: Frontend (Vercel) / Backend (Fly.io - Singapore Region 🇸🇬)

---

## สิ่งที่ต้องมีก่อนติดตั้ง (สำหรับผู้พัฒนา/กรรมการ)

โปรดตรวจสอบให้แน่ใจว่าในเครื่องของคุณติดตั้งโปรแกรมเหล่านี้แล้ว:

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
- [Git](https://git-scm.com/)

---

## วิธีการติดตั้งและรันใช้งานในเครื่อง (Local Development)

1. **โคลนโปรเจกต์ลงเครื่อง:**

   ```bash
   git clone https://github.com/iSaKaaaaaaa/CodeInTheDark.git
   cd CodeInTheDark
   ```

2. **ติดตั้ง Dependencies สำหรับ Frontend:**

   ```bash
   cd frontend
   npm install
   ```

3. **ติดตั้ง Dependencies สำหรับ Backend:**

   ```bash
   cd ../backend
   npm install
   ```

4. **รันใช้งานระบบ:**
   เราได้เตรียมคำสั่งลัดให้คุณรันทั้ง Frontend และ Backend ได้พร้อมกันจากโฟลเดอร์ `frontend`:
   ```bash
   cd ../frontend
   npm run dev:all
   ```
   _เปิดเบราว์เซอร์และเข้าไปที่: `http://localhost:5173` เพื่อเริ่มเล่น_

---

## วิธีการเล่นเกม

1. ทำการเข้าสู่ระบบ (Login) ด้วยชื่อผู้ใช้ (Username) ตามที่ต้องการและใส่รหัสผ่าน (Password) เป็น 1234
2. **ผู้เล่นคนที่ 1 (Host)**: ทำการกดสร้างห้อง (Create Room) และส่งรหัสห้อง (Room Code) 6 หลักให้เพื่อน
3. **ผู้เล่นคนที่ 2 (Joiner)**: กรอกรหัสห้องและชื่อผู้เล่นเพื่อทำการเข้าร่วมห้อง (Join Room)
4. ผู้เล่นที่สร้างห้อง (Host) จะเป็น Driver และผู้เล่นที่เข้าร่วมห้อง (Joiner) จะเป็น Navigator
5. ระหว่างเล่น เกมจะมีระบบ **Role Swap** เพื่อบังคับสลับบทบาทของผู้เล่นทั้งสองคนเป็นระยะ
6. ร่วมมือกันเขียนโค้ดตามคำสั่งเพื่อผ่านด่านและเอาชีวิตรอดให้ได้!

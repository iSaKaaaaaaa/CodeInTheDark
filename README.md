# Code in the Dark: Asymmetric Co-op Puzzle Game

ยินดีต้อนรับสู่โปรเจกต์ **Code in the Dark: Asymmetric Co-op Puzzle Game**! ที่สร้างด้วย React, Vite, Phaser (สำหรับระบบเกม) และ Node.js + Socket.IO สำหรับฝั่งเซิร์ฟเวอร์

## เทคโนโลยีที่ใช้

- **Frontend**: React (Vite), TypeScript, TailwindCSS, Phaser, Zustand, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, TypeScript

---

## สิ่งที่ต้องมีก่อนติดตั้ง

โปรดตรวจสอบให้แน่ใจว่าในเครื่องของคุณติดตั้งโปรแกรมเหล่านี้แล้ว:

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 16 ขึ้นไป)
- [Git](https://git-scm.com/)

---

## วิธีการติดตั้ง (Installation)

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

---

## การตั้งค่า Environment Variables (ตัวแปรระบบ)

คุณจำเป็นต้องสร้างไฟล์ `.env` สำหรับเชื่อมต่อ Frontend ไปยัง Backend

### ฝั่ง Backend (`backend/.env`)

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend`:

```env
PORT=3000
```

### ฝั่ง Frontend (`frontend/.env`)

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

_(หากคุณต้องการเทสออนไลน์ หรือนำขึ้นเซิร์ฟเวอร์จริง ให้เปลี่ยน URL นี้เป็นโดเมนของ Backend ของคุณ)_

---

## การรันโปรเจกต์ในเครื่อง (Local Development)

เราได้เตรียมคำสั่งลัดให้คุณสามารถรันทั้ง Frontend และ Backend ได้พร้อมกันจากโฟลเดอร์ `frontend` เลย!

1. เปิด Terminal และเข้าไปที่โฟลเดอร์ `frontend`:
   ```bash
   cd frontend
   ```
2. รันคำสั่งนี้เพื่อเปิดทั้ง 2 ระบบพร้อมกัน:
   ```bash
   npm run dev:all
   ```
3. เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

_(ระบบจะรัน Frontend ที่พอร์ต `5173` และ Backend ที่พอร์ต `3000`)_

---

## วิธีเปิดเซิร์ฟเวอร์เล่นกับเพื่อนผ่าน VS Code Port Forwarding

ถ้าอยากลองเล่นกับเพื่อนโดยที่ยังไม่ต้อง Deploy ขึ้นเซิร์ฟเวอร์จริง สามารถใช้ **VS Code Port Forwarding** ได้เลย:

1. รัน `npm run dev:all` ในโฟลเดอร์ `frontend` ทิ้งไว้
2. ใน VS Code ให้เปิดแท็บ **Ports** (ปกติจะอยู่ด้านล่างข้างๆ แท็บ Terminal)
3. ตรวจสอบให้แน่ใจว่าพอร์ต `3000` (Backend) และ `5173` (Frontend) โผล่ขึ้นมาในรายการ
4. **จุดสำคัญมาก:** คลิกขวาที่พอร์ตทั้งสอง แล้วเปลี่ยน **Port Visibility** ให้เป็น **Public** (ไม่งั้นเพื่อนจะเล่นไม่ได้)
5. ก๊อปปี้ Forwarded URL ของพอร์ต `3000` เอาไว้
6. เปิดไฟล์ `frontend/.env` แล้วนำ URL ที่ก๊อปมา ไปใส่แทนที่:
   ```env
   VITE_BACKEND_URL=https://<URL-ของ-พอร์ต-3000-ที่เพิ่งก๊อปมา>
   ```
7. เมื่อแก้ไฟล์ `.env` แล้ว ให้**รีสตาร์ท**เซิร์ฟเวอร์ใหม่ 1 รอบ (กด `Ctrl+C` เพื่อปิด แล้วพิมพ์ `npm run dev:all` รันใหม่)
8. ก๊อปปี้ Forwarded URL ของพอร์ต `5173` ส่งให้เพื่อนเข้าเล่นได้เลย!

---

## การ Build ระบบ (Production)

ถ้าต้องการรันระบบแบบพร้อมใช้งานจริง (แบบที่ถูก Build แล้ว):

1. สั่ง Build ทั้งสองฝั่ง:
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```
2. รันแบบ Production Preview:
   ```bash
   cd frontend
   npm run start:all
   ```
   _(คำสั่งนี้จะไปรัน `vite preview` พอร์ต `5173` และฝั่งเซิร์ฟเวอร์ด้วย `node dist/index.js`)_

---

## การนำขึ้นระบบเซิร์ฟเวอร์จริง (Deployment)

- **สำหรับ Backend (เช่น Render, Railway):**
  ตั้งค่า Root Directory เป็น `backend` ใช้คำสั่ง `npm install && npm run build` สำหรับการ Build และ `npm run start` สำหรับรัน
- **สำหรับ Frontend (เช่น Vercel, Netlify):**
  ตั้งค่า Root Directory เป็น `frontend` และ**อย่าลืม**เพิ่ม Environment Variable ชื่อ `VITE_BACKEND_URL` ให้ชี้ไปยัง URL ของเซิร์ฟเวอร์ Backend ที่เพิ่งนำขึ้น

---

## วิธีการเล่นเกม

1. ทำการเข้าสู่ระบบ (Login) ด้วย Username อะไรก็ได้ และ Password: 1234
2. ทำการสร้างห้อง (Create Room) แล้วส่งรหัสห้อง (Room Code) ให้เพื่อน
3. กรอกรหัสเพื่อเข้าห้อง (Join Room)
4. เมื่อเข้าเกม ผู้เล่นที่สร้างห้อง (Host) จะได้รับบทบาท Driver เสมอ และบทบาทอาจจะมีการสลับไปมาระหว่างที่เล่น
5. สื่อสารแลกเปลี่ยนข้อมูลกันจากข้อมูลที่ตนเองได้รับและไปถึงเส้นชัยให้ได้!

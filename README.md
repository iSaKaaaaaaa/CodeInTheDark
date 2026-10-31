# Code in the Dark: Asymmetric Co-op Puzzle Game

**Code in the Dark** เป็นเว็บเกมพัซเซิลแนวร่วมมือกันแบบอสมมาตร (2-Player Asymmetric Co-op Web Game) ที่ผู้เล่น 2 คนต้องแบ่งบทบาทเป็น **Driver** (ผู้เขียนโค้ดและควบคุมการเดิน) และ **Navigator** (ผู้นำทางและตรวจดูแผนผังเขาวงกต) โดยผู้เล่นทั้งสองจะได้รับข้อมูลบนหน้าจอไม่เท่ากัน พร้อมระบบ **Role Swap** สลับบทบาทอัตโนมัติทุก 2 นาที เพื่อท้าทายการสื่อสารและการจำลองแผนผังในจินตนาการ

---

## 🎮 กฎและระบบการเล่น (Gameplay Mechanics)

1. **โครงสร้างเขาวงกต (15x15 Grid Layout)**:
   - แผนที่ทั้งหมดมีขนาดทางกายภาพ 15x15 ช่อง โดยช่องขอบนอกสุด (`x, y = 0` หรือ `14`) เป็นกำแพงหินล้อมรอบ
   - พื้นที่เดินเล่นได้จริงมีขนาด 13x13 ช่อง กำกับด้วยพิกัดแนวตั้ง **1–13** (แถวบนลงล่าง) และแนวนอน **A–M** (คอลัมน์ซ้ายไปขวา)
2. **การแบ่งหน้าที่แบบอสมมาตร (Asymmetric Roles)**:
   - **Driver (พลขับ / ผู้เขียนโค้ด)**:
     - มองเห็น: จุดเกิด (`START`), ธงเส้นชัย (`GOAL`), กับดักและอุปสรรค (`traps`, `rocks`, `spikes`) และกำแพงขอบนอก
     - **ไม่เห็น**: กำแพงเขาวงกตด้านใน (Inner Stone Walls) ทั้งหมด
     - หน้าที่: ต่อบล็อกคำสั่ง Google Blockly (`move_up`, `move_down`, `move_left`, `move_right`) เพื่อสั่งให้ตัวละครเดิน
   - **Navigator (ผู้นำทาง)**:
     - มองเห็น: เส้นทางและกำแพงหินเขาวงกตด้านในทั้งหมด + หมอกปริศนา (Fog of War) รอบตำแหน่งผู้เล่น
     - **ไม่เห็น**: จุดธงเส้นชัย และตำแหน่งกับดัก/หิน/หนาม
     - หน้าที่: ดูหน้าจอ Blockly ของ Driver แบบเรียลไทม์ (View Only) และพิมพ์บอกทิศทางผ่านระบบ Chat ให้ Driver เดินหลบกำแพง
3. **ระบบสลับบทบาทอัตโนมัติ (Role Swap)**:
   - ทุก 120 วินาที (`SWAP_TIME = 120s`) ระบบจะบังคับสลับบทบาทระหว่าง Driver และ Navigator ทันที
   - Driver คนเดิมจะกลายเป็น Navigator และ Navigator จะกลายเป็น Driver เพื่อหยิบงานเขียนโค้ดต่อจากจุดเดิม
4. **ข้อจำกัดและเงื่อนไขแพ้-ชนะ (Constraints & Conditions)**:
   - **โควตาบล็อก (`MAX_BLOCKS = 50`)**: ผู้เล่นมีโควตาบล็อกรวม 50 บล็อกต่อด่าน หากใช้หมดก่อนถึงเส้นชัยจะพ่ายแพ้ทันที (`lose_blocks`)
   - **เวลาดันเจี้ยน (`DUNGEON_TIME = 300s`)**: ผู้เล่นมีเวลาจำกัด 5 นาที หากเวลาหมดจะพ่ายแพ้ทันที (`lose_time`)
   - **อุปสรรคในดันเจี้ยน**:
     - *Wall / Rock*: ชนแล้วโปรแกรมจะหยุดทำงานทันที ณ ตำแหน่งก่อนหน้า
     - *Spike*: เหยียบหนามแล้วจะกระเด็นถอยหลังกลับไป 1 ก้าว พร้อมหยุดโปรแกรม
     - *Trap*: ตกหลุมพรางแล้วตัวละครจะถูกส่งกลับไปยังจุดเริ่มต้น (`START`) ทันที
   - **ชัยชนะ (`win`)**: เดินตัวละครไปยังจุดธงเส้นชัย (`GOAL`) สำเร็จ ผู้เล่นทั้งสองจะได้รับเงินรางวัล 50 Coins (หากแพ้จะได้รับ 10 Coins ปลอบใจ)
5. **โหมดฝึกสอนแบบโต้ตอบ (Interactive Tutorial)**:
   - ระบบฝึกสอน 12 ขั้นตอนสำหรับผู้เล่นใหม่ ทดลองสื่อสารผ่าน Chat บังคับบล็อกเดินเดี่ยว และทดลองระบบสลับบทบาทในห้องจำลองก่อนเริ่มด่านจริง

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **Framework**: React 19, TypeScript 6, Vite 8
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` + `@theme`), Custom Fonts (`Bungee`, `VT323`, `Prompt`, `Chakra Petch`, `Press Start 2P`)
- **Blockly Engine**: Google Blockly v12.5.1 (ธีมอียิปต์โบราณ, Responsive SVG Scaling, Drag-and-drop code generation)
- **State Management**: Zustand v5 (Persist State ลง `sessionStorage`)
- **Networking & Auth**: Socket.IO Client v4.8, Axios, `@react-oauth/google`

### Backend
- **Runtime & Server**: Node.js, Express 5, TypeScript
- **Real-time Engine**: Socket.IO v4.8 (Room-based event dispatching & state sync)
- **Database & ODM**: MongoDB (Transactions enabled), Mongoose 9
- **Authentication**: `google-auth-library` (Google OAuth 2.0 Token Verification)
- **Network Resolution**: DNS Server override (`8.8.8.8`, `8.8.4.4`) รองรับการเชื่อมต่อ MongoDB Atlas SRV บนระบบปฏิบัติการ Windows

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Tree)

```text
CodeInTheDark/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # การเชื่อมต่อ MongoDB และตั้งค่า DNS fallback
│   │   ├── models/
│   │   │   ├── EconomyLog.ts         # ประวัติการแจกเหรียญและรางวัล
│   │   │   ├── GameSession.ts        # ข้อมูลเซสชันการเล่นเกม
│   │   │   ├── Map.ts                # ประวัติและ Schema ของแผนที่เขาวงกต
│   │   │   ├── MatchLog.ts           # บันทึก Chat และประวัติคำสั่ง (TTL 90 วัน)
│   │   │   └── User.ts               # ข้อมูลผู้ใช้งานและยอดเหรียญสะสม
│   │   ├── routes/
│   │   │   └── auth.ts               # Router สำหรับยืนยันตัวตน Google OAuth และตั้ง Username
│   │   ├── utils/
│   │   │   └── mapGenerator.ts       # อัลกอริทึมสร้างเขาวงกต Growing Tree / Prim แบบสุ่มด้วย Seed
│   │   ├── chatLog.ts                # ระบบจัดการบันทึกและธุรกรรม MongoDB Game Session
│   │   ├── index.ts                  # เซิร์ฟเวอร์หลัก Express + Socket.IO server
│   │   ├── roomManager.ts            # การจัดการสถานะห้อง เมมเบอร์ และระบบ Public/Private Lobby
│   │   ├── routes.ts                 # Express REST APIs (ห้องสาธารณะ และประวัติการเล่น)
│   │   ├── socketHandlers.ts         # ศูนย์รวม Event Handlers สำหรับ Socket.IO
│   │   └── types.ts                  # TypeScript Interfaces สำหรับ Backend
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── sounds/
│   │   │   └── bgsound.mp3           # ดนตรีประกอบเกม
│   │   ├── sprites/                  # Sprite ตัวละคร กำแพง หลุมพราง หิน หนาม
│   │   └── ui/                       # ภาพพื้นหลัง ป้ายประกาศ และกรอบหน้าต่าง UI
│   ├── src/
│   │   ├── blockly/
│   │   │   ├── blocks.ts             # ประกาศ Schema และลักษณะบล็อกคำสั่ง 4 ทิศทาง
│   │   │   ├── generator.ts          # ตัวแปลงโค้ดบล็อก และฟังก์ชันแกะชุดคำสั่ง (Command Extractor)
│   │   │   └── toolbox.ts            # การตั้งค่า Flyout Toolbox สำหรับ Blockly
│   │   ├── components/
│   │   │   ├── driver/
│   │   │   │   ├── BlockCodePanel.tsx# กล่องพื้นที่โค้ด แถบสถานะโควตาบล็อก และปุ่มสั่งรัน
│   │   │   │   ├── ChatBox.tsx       # กล่องสนทนาแบบเรียลไทม์ พร้อมการ์ดแจ้งเตือนระบบ
│   │   │   │   ├── GameBoard.tsx     # กระดานตารางเขาวงกต 13x13 พิกัด A–M พร้อม Fog of War
│   │   │   │   └── GameHeader.tsx    # แถบหัวเกม แสดงบทบาท เวลาด่าน และเวลาก่อนสลับบทบาท
│   │   │   ├── BlocklyEditor.tsx     # คอมโพเนนต์ Mount Workspace Blockly พร้อมระบบ Auto-Scaling
│   │   │   └── TopRightMenu.tsx      # เมนูตั้งค่าเสียง เปิด/ปิดเสียงเพลง และปุ่มออกจากห้อง
│   │   ├── constants/
│   │   │   └── game.ts               # ค่าคงที่เกม (ขนาดกริด เวลาด่าน โควตาบล็อก ความเร็วเดิน)
│   │   ├── hooks/
│   │   │   ├── useGameMovement.ts    # ลูปประมวลผลการเดิน ตรวจสอบการชนอุปสรรค และการส่งผลรัน
│   │   │   ├── useGameSync.ts        # จัดการการซิงค์สถานะเกมและบล็อกโค้ดระหว่างผู้เล่น
│   │   │   ├── useGameTimer.ts       # นาฬิกานับถอยหลังเวลาด่าน และตัวนับสลับบทบาท Role Swap
│   │   │   └── useTutorial.ts        # ตัวควบคุมขั้นตอนฝึกสอนแบบอินเทอร์แอคทีฟ
│   │   ├── screens/
│   │   │   ├── CreateRoomScreen.tsx  # หน้าสร้างห้อง รหัสห้อง 6 หลัก และสลับ Public/Private
│   │   │   ├── GameScreen.tsx        # หน้าจอหลักสำหรับการเล่นเกม
│   │   │   ├── JoinRoomScreen.tsx    # หน้ารวมห้องสาธารณะและช่องกรอกรหัสห้อง
│   │   │   ├── LandingPage.tsx       # หน้าแรกและคำแนะนำเกม
│   │   │   ├── LoginModal.tsx        # หน้าต่างล็อกอินผ่าน Google Sign-In
│   │   │   ├── SelectPlayScreen.tsx  # หน้าเลือกโหมด (สร้างห้อง / ค้นหาห้อง)
│   │   │   └── SetUsernameModal.tsx  # หน้าต่างกรอกชื่อผู้เล่นครั้งแรก
│   │   ├── store/
│   │   │   └── useSocketStore.ts     # Zustand Store ควบคุมการเชื่อมต่อและสถานะทั้งแอป
│   │   ├── types/
│   │   │   └── game.ts               # มาตรฐาน Payload Data Types ระหว่างหน้าบ้านและหลังบ้าน
│   │   ├── utils/
│   │   │   └── mapLocation.ts        # ตัวแปลงพิกัดตารางเป็นคำอธิบายพื้นที่ภาษาธรรมชาติ
│   │   ├── App.tsx                   # คอมโพเนนต์หลัก จัดการระบบเสียงและ Screen Router
│   │   ├── index.css                 # สไตล์ชีตรวมศูนย์ Tailwind CSS v4, @theme และ Custom Fonts
│   │   └── main.tsx                  # จุดเริ่มต้น React App และ GoogleOAuthProvider
│   ├── index.html                    # HTML Shell และการโหลด Web Fonts จาก Google
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มใช้งาน (Installation & Setup)

### สิ่งที่ต้องเตรียม (Prerequisites)
1. **Node.js**: เวอร์ชัน 18.0.0 หรือใหม่กว่า
2. **MongoDB Database**: MongoDB Local Instance (พอร์ต 27017) หรือ MongoDB Atlas Cluster URI
3. **Google OAuth 2.0 Client ID**: สร้างจาก Google Cloud Console (APIs & Services > Credentials)

### 1. โคลนโปรเจกต์
```bash
git clone https://github.com/iSaKaaaaaaa/CodeInTheDark.git
cd CodeInTheDark
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/codeinthedark
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/`:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. ติดตั้ง Dependencies และรันโปรเจกต์

เปิด Terminal แยก 2 หน้าต่าง หรือรันผ่านคำสั่งลัด:

**หน้าต่างที่ 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**หน้าต่างที่ 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

_หรือรันพร้อมกันจากโฟลเดอร์ `frontend` ด้วยคำสั่งเดียว:_
```bash
cd frontend
npm run dev:all
```

เปิดเบราว์เซอร์แล้วเข้าใช้งานที่: `http://localhost:5173`

---

## 📖 คู่มือฟังก์ชันการทำงานทั้งระบบ (Function Manual)

### 1. หมวด Blockly Modules (`frontend/src/blockly/*`)
- **`registerBlocks(): void`** (`blocks.ts`)
  - *Input*: ไม่มี
  - *Output*: `void`
  - *คำอธิบาย*: ลงทะเบียนโครงสร้างบล็อกคำสั่ง 4 ทิศทาง (`move_up`, `move_down`, `move_left`, `move_right`) เข้ากับระบบ Blockly พร้อมกำหนดสีและเลเบลสไตล์โบราณ
- **`registerGenerators(): void`** (`generator.ts`)
  - *Input*: ไม่มี
  - *Output*: `void`
  - *คำอธิบาย*: กำหนดฟังก์ชันแปลงบล็อกแต่ละชนิดเป็นรหัสภาษา JavaScript (`moveUp();`, `moveDown();`, ฯลฯ)
- **`extractWorkspaceCommands(workspace: Blockly.WorkspaceSvg | null): ExtractedWorkspaceCommands`** (`generator.ts`)
  - *Input*: `workspace` (อินสแตนซ์ของ Blockly Workspace)
  - *Output*: `{ commandBlocks: ExtractedCommandBlock[]; blockTypes: string[]; totalBlocks: number }`
  - *คำอธิบาย*: เดินไล่บล็อกที่เชื่อมต่อกันจาก Top Block ก้อนแรกตามลำดับเพื่อสกัดเป็นชุดคำสั่งสำหรับสั่งให้ตัวละครเดินจริง

### 2. หมวด Custom Hooks (`frontend/src/hooks/*`)
- **`useGameMovement(options: UseGameMovementOptions)`** (`useGameMovement.ts`)
  - *Input*: สถานะผู้เล่น, พิกัดตำแหน่ง, แผนที่, Socket, Ref โควตาบล็อก และฟังก์ชันอัปเดต State ต่างๆ
  - *Output*: `{ runProgram: () => Promise<void>, resetGameToNewStart: () => void, emitGameState: (overrides?: any) => void }`
  - *คำอธิบาย*: ควบคุมการรันโปรแกรมการเดินแบบอะซิงโครนัสทีละ 350ms ตรวจสอบการชนกำแพง หิน หนาม กับดัก หรือธงเส้นชัย พร้อมระบบยกเลิกการรันทันทีเมื่อเกิด Role Swap หรือรีเซ็ตเกม
- **`useGameTimer(options: UseGameTimerOptions): void`** (`useGameTimer.ts`)
  - *Input*: Socket, บทบาทปัจจุบัน (`role`), Ref จัดการสเตตัส และฟังก์ชันอัปเดตเวลา
  - *Output*: `void`
  - *คำอธิบาย*: นาฬิกานับถอยหลังเวลาด่าน (`dungeonTimeLeft`) และเวลาก่อนสลับบทบาท (`swapTimeLeft`) โดยฝั่ง Driver เป็นผู้ส่งสัญญาณซิงค์ไปยัง Navigator และยิง Event `trigger_role_swap` เมื่อถึงกำหนด
- **`useGameSync(options: UseGameSyncOptions): void`** (`useGameSync.ts`)
  - *Input*: Socket, Workspace Ref, ฟังก์ชันอัปเดตตำแหน่ง พิกัด และสถานะต่างๆ
  - *Output*: `void`
  - *คำอธิบาย*: สมาชิกฝั่ง Navigator รับข้อมูลซิงค์กระดานเกมและบล็อก XML จาก Driver พร้อมระบบป้องกันการสะท้อนข้อมูลกลับ (`Blockly.Events.disable()`)
- **`useTutorial(options: UseTutorialOptions)`** (`useTutorial.ts`)
  - *Input*: บทบาท, Socket, ฟังก์ชันควบคุม UI การฝึกสอน
  - *Output*: สเตปการฝึกสอนปัจจุบัน, การ์ดข้อความคำแนะนำ, ฟังก์ชันตรวจสอบข้อความแชต และฟังก์ชันส่งสัญญาณพร้อมเริ่มเล่น
  - *คำอธิบาย*: จัดการเงื่อนไขและเควสต์ในโหมดฝึกสอน เช่น ลากบล็อกสำเร็จ, พิมพ์แชตพิกัดถูกต้อง, และยืนยันความพร้อม

### 3. หมวดคอมโพเนนต์และการแสดงผล (`frontend/src/components/*`)
- **`BlocklyEditor({ onReady, readOnly, onMetricsChange })`** (`BlocklyEditor.tsx`)
  - *Input*: Props ควบคุมโหมดอ่านอย่างเดียว (สำหรับ Navigator) และ Callback เมื่อ Workspace พร้อม
  - *Output*: JSX Element ของพื้นที่ต่อบล็อกคำสั่ง
  - *คำอธิบาย*: ฝัง Blockly เข้ากับ DOM จัดการคำนวณสเกล Responsive SVG ล็อกตำแหน่งถังขยะ และคืนหน่วยความจำด้วย `workspace.dispose()` เมื่อ Unmount
- **`GameBoard({ playerX, playerY, direction, walls, traps, rocks, spikes, goal, role })`** (`GameBoard.tsx`)
  - *Input*: พิกัดตัวละคร, ทิศทางหันหน้า, ข้อมูลตำแหน่งอุปสรรค, จุดธง, และบทบาทของผู้เล่น
  - *Output*: JSX Element แสดงตารางพิกัด 13x13 (A–M, 1–13)
  - *คำอธิบาย*: วาดกระดานดันเจี้ยนโดยซ่อนหรือแสดงองค์ประกอบตามบทบาท (Driver ไม่เห็นกำแพงใน / Navigator ไม่เห็นกับดักและธง พร้อมคลุมหมอก Fog of War)
- **`ChatBox({ onTutorialChatSent, onValidateTutorialChat, isTutorialActive, mockMessage, resetSignal })`** (`ChatBox.tsx`)
  - *Input*: Props สำหรับจัดการ Event สนทนาและการตรวจสอบข้อความในโหมดฝึกสอน
  - *Output*: JSX Element ของกล่องแชตเรียลไทม์
  - *คำอธิบาย*: รับส่งข้อความผ่าน Socket.IO แสดงการ์ดข้อความแจ้งเตือนจากระบบ (`[SYSTEM]`) และข้อความแนะนำในโหมดฝึกสอน
- **`BlockCodePanel({ blocksLeft, maxBlocks, onRun, onReady, readOnly, executionError })`** (`BlockCodePanel.tsx`)
  - *Input*: สถิติจำนวนบล็อกที่เหลือ, สถานะ Error, Callback สั่งรัน และโหมด Read-Only
  - *Output*: JSX Element รวมพื้นที่ Toolbox และ Workspace ของ Blockly
  - *คำอธิบาย*: แสดงผลแผงเขียนโปรแกรม, ตัวนับจำนวนบล็อกที่เหลือ และปุ่ม RUN PROGRAM สำหรับ Driver
- **`GameHeader({ role, dungeonTime, dungeonTimeLeft, swapTime, swapProgress, swapTimeLeft })`** (`GameHeader.tsx`)
  - *Input*: บทบาทผู้เล่น, เวลาด่านที่เหลือ, และสถานะความคืบหน้าของตัวนับเวลา Role Swap
  - *Output*: JSX Element ของแถบ Header ด้านบน
  - *คำอธิบาย*: แสดง Badge บทบาทผู้เล่น, หลอดนับถอยหลัง Role Swap, นาฬิกาด่านพร้อมสีเตือนความเร่งด่วน และปุ่มตั้งค่าเสียง
- **`TopRightMenu({ inline })`** (`TopRightMenu.tsx`)
  - *Input*: `inline?: boolean` (กำหนดรูปแบบแสดงผลในแถบ Header หรือลอยขวาบน)
  - *Output*: JSX Element ของเมนูตั้งค่าเสียงเพลง ยอดเหรียญ และปุ่มออกจากห้อง

### 4. หมวด State Store & Utilities (`frontend/src/store/*`, `frontend/src/utils/*`)
- **`useSocketStore`** (`useSocketStore.ts`)
  - *Actions*:
    - `loginWithGoogle(payload)`: ส่ง Google Credential ไปตรวจสอบที่ Backend และบันทึกข้อมูล User
    - `submitUsername(username)`: บันทึกชื่อผู้เล่นสำหรับผู้ใช้ใหม่
    - `createRoom()`: เชื่อมต่อ Socket.IO และส่งคำขอสร้างห้องใหม่แบบสุ่มรหัส 6 หลัก
    - `joinRoom(roomCode)`: เข้าร่วมห้องที่ระบุด้วยรหัส 6 หลัก
    - `setRoomVisibility(isPublic)`: สลับสถานะห้องระหว่างสาธารณะและส่วนตัว
    - `startGame()`: ส่งคำขอเริ่มเกมไปยังเซิร์ฟเวอร์
    - `leaveStage()`: ขอยุติการเล่นและกลับสู่ห้องล็อบบี้
    - `reconnect()`: กู้คืนการเชื่อมต่อ Socket เมื่อผู้ใช้กด Refresh หน้าจอ
    - `toggleMute()` / `setVolume(volume)`: ปรับระดับเสียงดนตรีประกอบ
- **`describeArea(x: number, y: number): string`** (`mapLocation.ts`)
  - *Input*: พิกัดตัวเลข `x, y` (1–13)
  - *Output*: คำบรรยายตำแหน่งภาษาอังกฤษ เช่น `"near the top-right corner"`, `"in the middle of the map"`

### 5. หมวดเซิร์ฟเวอร์และฐานข้อมูล (`backend/src/*`)
- **`registerSocketHandlers(io: Server): void`** (`socketHandlers.ts`)
  - *Input*: อินสแตนซ์ Socket.IO Server
  - *Output*: `void`
  - *คำอธิบาย*: ผูกการทำงานของ Socket Event ทั้งหมด (`join_room`, `chat_message`, `start_game`, `run_result`, `end_game`, `sync_game_state`, `sync_blockly`, `highlight_block`, `trigger_role_swap`, `obstacle_hit`, `disconnect`)
- **`saveChatLog(roomCode, playerNames, gameMetrics?, mapData?): Promise<Map<string, number> | null>`** (`chatLog.ts`)
  - *Input*: รหัสห้อง, รายชื่อผู้เล่น, สถิติการเล่น (ผลแพ้/ชนะ เวลา จำนวนบล็อก), และโครงสร้างแผนที่
  - *Output*: `Promise` ของ Map ยอดเหรียญล่าสุดของผู้เล่น
  - *คำอธิบาย*: ทำงานภายใต้ MongoDB Transaction บันทึกข้อมูลลง `MapModel`, `GameSession`, `MatchLog`, ปรับยอดเหรียญสะสมใน `User` (+50 ชนะ / +10 แพ้) และสร้างบันทึก `EconomyLog`
- **`generateMap(physicalWidth, physicalHeight, seed?): GeneratedMap`** (`utils/mapGenerator.ts`)
  - *Input*: ความกว้างและความสูงทางกายภาพ (15x15), ค่า Seed สำหรับสุ่ม (Optional)
  - *Output*: โครงสร้างแผนที่ที่มีกำแพงหิน จุดเกิด จุดธงเส้นชัย หลุมพราง หิน และหนาม
  - *คำอธิบาย*: ใช้อัลกอริทึม Growing Tree ผสม Prim เพื่อสร้างเขาวงกตที่รับประกันว่ามีทางเดินเชื่อมโยงถึงเส้นชัยได้อย่างแน่นอน (Shortest Path Validated)
- **`roomManager.ts`**:
  - `createRoomMeta(roomCode, hostSocketId, hostName)`: บันทึกข้อมูลเริ่มต้นของห้อง
  - `setRoomPublic(roomCode, socketId, isPublic)`: เปลี่ยนการมองเห็นห้องเป็นสาธารณะ (ทำได้เฉพาะ Host)
  - `getPublicRooms()`: คืนค่ารายการห้องสาธารณะที่เปิดรอผู้เล่นคนที่ 2
  - `addUserToRoom(socketId, userInfo)` / `removeUserFromRoom(socketId)`: จัดการผู้เล่นเข้าออกห้อง

---

## 🔄 ลำดับการไหลของข้อมูลในระบบ (End-to-End System Data Flow)

```text
[ ผู้เล่นคนที่ 1 (Host) ]                    [ เซิร์ฟเวอร์ (Node.js / Socket.IO) ]               [ ผู้เล่นคนที่ 2 (Joiner) ]
            |                                                    |                                                    |
 1. เข้าสู่ระบบ (Google OAuth)                                     |                                         1. เข้าสู่ระบบ (Google OAuth)
    ====== POST /api/auth/google =====> บันทึก/โหลด User MongoDB   |                                         |
            |                                                    |                                         |
 2. กดสร้างห้อง (Create Room)                                     |                                         |
    --- socket.emit("join_room") ----> สร้างห้อง รหัส 6 หลัก       |                                         |
    <-- socket.emit("room_users") ---- ส่งสถานะ Host = Driver     |                                         |
            |                                                    |                                         |
            |                                                    |<--- socket.emit("join_room") ----------- 2. เข้าร่วมห้องด้วยรหัส 6 หลัก
            |                                                    |--- socket.emit("room_users") ----------> รับสถานะ Guest = Navigator
            |                                                    |                                                    |
 3. กดเริ่มเกม (Start Game)                                       |                                                    |
    --- socket.emit("start_game") ---> generateMap(15, 15)       |                                                    |
    <-- io.emit("start_game") <-------- กระจาย MapData ให้ทั้งคู่ --------> io.emit("start_game") -------------------|
            |                                                    |                                                    |
 4. เขียนบล็อกคำสั่ง (Driver)                                      |                                         4. ดูแผนที่และพิมพ์บอกทาง (Navigator)
    - ต่อบล็อก Move Up/Down/Left/Right                           |                                         - เห็นกำแพงใน + หมอก Fog of War
    --- socket.emit("sync_blockly") -> ส่ง XML โค้ดบล็อก ------->|--- socket.emit("sync_blockly") --------> - มองเห็นบล็อกแบบ View-Only
            |                                                    |<--- socket.emit("chat_message") --------- - พิมพ์แนะนำ เช่น "เดินขวา 2 ก้าว"
    <-- socket.emit("chat_message") -- แสดงข้อความในแชต --------|                                                    |
            |                                                    |                                                    |
 5. กดสั่งรันโปรแกรม (Run Program)                                |                                                    |
    - สกัดคำสั่งด้วย extractWorkspaceCommands                     |                                                    |
    - ตัวละครขยับทีละ 350ms                                      |                                                    |
    --- socket.emit("sync_game_state") > อัปเดตพิกัด/ทิศทาง ----->|--- socket.emit("sync_game_state") --------> ขยับตัวละครบนกระดานตาม
    --- socket.emit("highlight_block") > ไฮไลต์บล็อกที่ทำงาน --->|--- socket.emit("highlight_block") -------> ไฮไลต์บล็อกบนจอ Navigator
            |                                                    |                                                    |
 6. สลับบทบาทอัตโนมัติ (Role Swap ทุก 120s)                       |                                                    |
    - เวลาครบกำหนด -> useGameTimer                               |                                                    |
    --- socket.emit("trigger_role_swap") ----------------------->|--- socket.emit("role_swap") ------------> Navigator กลายเป็น Driver คนใหม่!
    - Driver เดิมกลายเป็น Navigator                               |                                         - Workspace ถูกล้างพร้อมต่อโค้ดใหม่
            |                                                    |                                                    |
 7. ถึงเส้นชัย หรือ หมดเวลา/โควตาหมด                                |                                                    |
    --- socket.emit("end_game") -----> เปิด MongoDB Transaction   |                                                    |
                                       - บันทึก MatchLog          |                                                    |
                                       - บันทึก GameSession       |                                                    |
                                       - แจกเหรียญ (+50 / +10)    |                                                    |
    <-- socket.emit("coins_updated") -- อัปเดตเหรียญสะสม --------|--- socket.emit("coins_updated") --------> แสดงหน้าต่างผลการเล่นพร้อมเหรียญ
```

---

## 👥 ผู้พัฒนาและลิขสิทธิ์ (Authors & License)
โปรเจกต์นี้พัฒนาขึ้นเพื่อการเรียนรู้และการนำเสนอโครงงานเว็บแอปพลิเคชันเกมแบบอสมมาตร (Asymmetric Cooperative Web Game) 
ลิขสิทธิ์ซอร์สโค้ดเป็นไปตามข้อกำหนดของทีมผู้พัฒนา **Code In The Dark**.

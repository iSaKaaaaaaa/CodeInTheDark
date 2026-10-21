import { useEffect, useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
  // ซ่อนข้อความหน้าแรกตอนป๊อปอัป Login เปิดอยู่ (เหมือนพฤติกรรมเดิม)
  contentHidden?: boolean;
}

export default function LandingPage({ onStart, contentHidden = false }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // หน่วงเวลาเล็กน้อยเพื่อให้ Animation ทำงานตอนโหลดหน้าเว็บ
    setMounted(true);
  }, []);

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat cursor-pointer overflow-hidden font-pixel"
      // ฉากพระอาทิตย์ขึ้นเดิมตามโจทย์
      style={{ backgroundImage: "url('/ui/landing.png')" }}
      onClick={onStart}
    >
      {/* Vignette บางๆ เพื่อคุมความสว่างขอบจอ */}
      <div className="absolute inset-0 bg-black/10 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] pointer-events-none" />

      {!contentHidden && (
        <>
          {/* 
            [จุดแก้ 1, 3, 7]: 
            - ยึดแนวขวา (items-end text-right) แนบกับเสาวิหารฝั่งขวา ให้มี Anchor ชัดเจน
            - ปรับขนาดฟอนต์ให้สมดุล (text-5xl md:text-7xl lg:text-8xl) ไม่หนักฝั่งขวาจนแย่งความสมมาตรของฉาก
          */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 right-6 md:right-16 lg:right-24 flex flex-col items-end text-right leading-none transition-all duration-1000 ease-out transform ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
            }`}
          >
            {/* 
              [จุดแก้ 1]: Multi-layer Outline สีกาแฟเข้ม (#2a1b12) รอบตัวอักษร ตัดปัญหา Contrast ไม่สม่ำเสมอระหว่างม่านมืดกับแสงอาทิตย์
              [จุดแก้ 2]: กระชับ Line Spacing (leading-[0.85] และ -mt-1) ให้ชื่อเกมเกาะกลุ่มเป็นบล็อกเดียวกัน
            */}
            <h1 
              className="text-[#fde68a] text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-bold uppercase tracking-tight transition-transform hover:scale-105 duration-300" 
              style={{ 
                textShadow: "4px 4px 0px #2a1b12, -3px -3px 0px #2a1b12, 3px -3px 0px #2a1b12, -3px 3px 0px #2a1b12, 0px 10px 20px rgba(0,0,0,0.85)" 
              }}
            >
              Code In
            </h1>
            <h1 
              className="text-[#fde68a] text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-bold uppercase tracking-tight -mt-2 md:-mt-4 lg:-mt-5 transition-transform hover:scale-105 duration-300" 
              style={{ 
                textShadow: "4px 4px 0px #2a1b12, -3px -3px 0px #2a1b12, 3px -3px 0px #2a1b12, -3px 3px 0px #2a1b12, 0px 10px 20px rgba(0,0,0,0.85)" 
              }}
            >
              The Dark
            </h1>
          </div>
          
          {/* 
            [จุดแก้ 4, 5, 6]: 
            - ขยับขึ้นมาจากขอบล่างเป็น bottom-16 md:bottom-20 ป้องกันการโดน Crop หรือ Taskbar บัง
            - เพิ่ม Torch Light Glow (อิงสีคบเพลิงไฟส้มทอง #f59e0b) ขอบสว่าง และ Hover State ชัดเจน เพื่อให้เป็น Interactive Element แท้จริง
          */}
          <div className={`absolute bottom-16 md:bottom-20 w-full text-center transition-opacity duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="inline-block relative group">
              {/* แสงเรืองคบเพลิงดึงดูดสายตาด้านหลังปุ่ม (Torch Glow Effect) */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#f59e0b]/40 via-[#b45309]/50 to-[#f59e0b]/40 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
              
              <p
                className="relative text-[#fffbeb] font-bold text-lg md:text-2xl tracking-wider uppercase bg-[#451a03]/90 backdrop-blur-md px-8 py-3.5 rounded-full border-2 border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:bg-[#78350f] group-hover:border-[#fbbf24] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] group-hover:scale-105 active:scale-95 transition-all font-thai"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
              >
                - คลิกที่ใดก็ได้เพื่อเริ่มเล่น -
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className="absolute bottom-4 left-6 text-[#fde68a]/40 text-xs md:text-sm tracking-wider pointer-events-none">
            v1.0.0 • ASYMMETRIC PUZZLE
          </div>
        </>
      )}
    </div>
  );
}
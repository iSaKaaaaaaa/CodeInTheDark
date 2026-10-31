import { useEffect, useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
  // ซ่อนเนื้อหาหน้า Landing เมื่อป๊อปอัป Login หรือโมดอลอื่นกำลังเปิดใช้งาน
  contentHidden?: boolean;
}

/**
 * หน้าจอเริ่มต้นเกม (Landing Page):
 * - แสดงภาพพื้นหลังธีมวิหารโบราณพร้อมแสงเงา Vignette
 * - แสดงชื่อเกม Code In The Dark พร้อมแอนิเมชันเปิดตัว
 * - ปุ่ม Click Anywhere to Start เรืองแสงเอฟเฟกต์คบเพลิง (Torch Glow) สำหรับเริ่มเข้าสู่เกม
 */
export default function LandingPage({ onStart, contentHidden = false }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // หน่วงเวลาเล็กน้อยเพื่อให้ CSS Transition เริ่มทำงานตอนหน้าเว็บโหลดเสร็จ
    setMounted(true);
  }, []);

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat cursor-pointer overflow-hidden font-pixel"
      style={{ backgroundImage: "url('/ui/landing.png')" }}
      onClick={onStart}
    >
      {/* เงา Vignette ปรับระดับความมืดรอบขอบจอ */}
      <div className="absolute inset-0 bg-black/10 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] pointer-events-none" />

      {!contentHidden && (
        <>
          {/* ส่วนแสดงหัวข้อชื่อเกม จัดชิดขวาให้กลมกลืนกับเสาวิหาร */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 right-6 md:right-16 lg:right-24 flex flex-col items-end text-right leading-none transition-all duration-1000 ease-out transform ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
            }`}
          >
            {/* ข้อความชื่อเกมพร้อมเงา Multi-layer Outline สไตล์พิกเซล */}
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

          {/* ปุ่มเรืองแสงคำแนะนำคลิกเพื่อเริ่มเกม */}
          <div className={`absolute bottom-14 md:bottom-16 w-full text-center transition-opacity duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="inline-block relative group">
              {/* แสงเรืองคบเพลิงด้านหลังปุ่ม (Torch Glow Effect) */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#f59e0b]/40 via-[#b45309]/50 to-[#f59e0b]/40 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />

              <p
                className="relative text-[#fffbeb] font-bold text-xs sm:text-sm md:text-base tracking-wide uppercase bg-[#451a03]/90 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:bg-[#78350f] group-hover:border-[#fbbf24] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] group-hover:scale-105 active:scale-95 transition-all font-bungee"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
              >
                - CLICK ANYWHERE TO START -
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
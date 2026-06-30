interface LandingPageProps {
  onStart: () => void;
  // ซ่อนข้อความหน้าแรกตอนป๊อปอัป Login เปิดอยู่ (เหมือนพฤติกรรมเดิม)
  contentHidden?: boolean;
}

export default function LandingPage({ onStart, contentHidden = false }: LandingPageProps) {
  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat cursor-pointer overflow-hidden font-pixel"
      // ฉากหน้าแรกสุดที่เป็นพระอาทิตย์ขึ้น
      style={{ backgroundImage: "url('/landing.png')" }}
      onClick={onStart}
    >
      {!contentHidden && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 right-10 md:right-32 flex flex-col items-start leading-none tracking-widest drop-shadow-md">
            <h1 className="text-black text-6xl md:text-8xl lg:text-9xl font-bold">Code In</h1>
            <h1 className="text-black text-6xl md:text-8xl lg:text-9xl font-bold mt-4">The Dark</h1>
          </div>
          <div className="absolute bottom-12 w-full text-center">
            <p className="text-gray-900 font-bold text-2xl md:text-3xl animate-pulse drop-shadow-md">
              - Click Anywhere to Start -
            </p>
          </div>
        </>
      )}
    </div>
  );
}
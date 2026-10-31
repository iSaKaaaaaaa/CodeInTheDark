import { useEffect, useRef, lazy, Suspense } from "react";
import LandingPage from "./screens/LandingPage";
import LoginModal from "./screens/LoginModal";
import SetUsernameModal from "./screens/SetUsernameModal";
import SelectPlayScreen from "./screens/SelectPlayScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";
import { useSocketStore } from "./store/useSocketStore";

// Lazy load GameScreen เพื่อเพิ่มประสิทธิภาพในการโหลดหน้าเว็บครั้งแรก
const GameScreen = lazy(() => import("./screens/GameScreen"));

export default function App() {
  const { currentScreen, setScreen, socket, roomCode, reconnect, isMuted, volume } = useSocketStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  // เชื่อมต่อ Socket อัตโนมัติหากหน้าเว็บถูกรีเฟรชแต่ยังมี roomCode ค้างอยู่ใน Session
  useEffect(() => {
    if (!socket && roomCode) {
      reconnect();
    }
  }, [socket, roomCode, reconnect]);

  // ควบคุมเสียงเพลงพื้นหลัง (เริ่มเล่นเฉพาะในหน้าจอเกม และวนลูปตั้งแต่ช่วงวินาทีที่ 10)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, (volume / 100) * 0.25));
      audioRef.current.muted = isMuted;

      if (currentScreen === 'game') {
        if (audioRef.current.currentTime === 0) {
          audioRef.current.currentTime = 10;
        }
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentScreen, isMuted, volume]);

  // วนลูปเพลงพื้นหลังกลับไปที่วินาทีที่ 10 เพื่อความต่อเนื่องของดนตรี
  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 10;
      audioRef.current.play().catch(e => console.log('Audio loop play failed:', e));
    }
  };

  // กำหนดคอมโพเนนต์หน้าจอที่จะแสดงผลตามสถานะ currentScreen ใน Store
  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <LandingPage
            onStart={() => setScreen('login')}
          />
        );
      case 'login':
        return (
          <div className="relative">
            <LandingPage onStart={() => {}} contentHidden={true} />
            <LoginModal />
          </div>
        );
      case 'set_username':
        return (
          <div className="relative">
            <LandingPage onStart={() => {}} contentHidden={true} />
            <SetUsernameModal />
          </div>
        );
      case 'select':
        return <SelectPlayScreen />;
      case 'create':
        return <CreateRoomScreen />;
      case 'join':
        return <JoinRoomScreen />;
      case 'game':
        return (
          <Suspense fallback={<div className="h-screen flex items-center justify-center text-white bg-black font-pixel text-2xl">Loading...</div>}>
            <GameScreen />
          </Suspense>
        );
      default:
        return <LandingPage onStart={() => setScreen('login')} />;
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/bgsound.mp3" onEnded={handleAudioEnded} />
      {renderScreen()}
    </>
  );
}

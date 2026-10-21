import LandingPage from "./screens/LandingPage";
import LoginModal from "./screens/LoginModal";
import SetUsernameModal from "./screens/SetUsernameModal";
import SelectPlayScreen from "./screens/SelectPlayScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";
import { useEffect, useRef } from "react";
import GameScreen from "./screens/GameScreen";
import { useSocketStore } from "./store/useSocketStore";

export default function App() {
  const { currentScreen, setScreen, socket, roomCode, reconnect, isMuted, volume } = useSocketStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!socket && roomCode) {
      reconnect();
    }
  }, [socket, roomCode, reconnect]);

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

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 10;
      audioRef.current.play().catch(e => console.log('Audio loop play failed:', e));
    }
  };

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
        return <GameScreen />;
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

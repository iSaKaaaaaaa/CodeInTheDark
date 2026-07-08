import { useState } from "react";
import "./App.css";
import LandingPage from "./screens/LandingPage";
import LoginModal from "./screens/LoginModal";
import GameScreen from "./screens/GameScreen";
import { useSocketStore } from "./store/useSocketStore";

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { role } = useSocketStore();

  // 1. ถ้า Login ผ่านแล้ว ให้โชว์หน้าจอตาม Role (Driver / Navigator)
  if (isLoggedIn) {
    return <GameScreen />;
  }

  // 2. ถ้ายังไม่ Login ให้โชว์หน้าจอแรก (Landing) + ป๊อปอัป Login
  return (
    <div className="relative">
      <LandingPage
        onStart={() => !isLoginModalOpen && setIsLoginModalOpen(true)}
        contentHidden={isLoginModalOpen}
      />
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={() => setIsLoggedIn(true)}
        />
      )}
    </div>
  );
}

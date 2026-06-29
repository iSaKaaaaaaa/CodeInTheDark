import React, { useState } from 'react';
import './App.css'; // import ไว้เฉยๆ ไม่ให้พัง แม้ไฟล์จะว่างเปล่า
import LandingPage from './screens/LandingPage';
import LoginModal from './screens/LoginModal';
import DriverScreen from './screens/DriverScreen';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. ถ้า Login ผ่านแล้ว ให้โชว์หน้า Driver (เกมเพลย์)
  if (isLoggedIn) {
    return <DriverScreen />;
  }

  // 2. ถ้ายังไม่ Login ให้โชว์หน้าจอแรก (Landing) + ป๊อปอัป Login เมื่อถูกเปิด
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

export default App;
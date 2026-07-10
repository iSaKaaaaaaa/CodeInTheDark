import "./App.css";
import LandingPage from "./screens/LandingPage";
import LoginModal from "./screens/LoginModal";
import SelectPlayScreen from "./screens/SelectPlayScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";
import { useEffect } from "react";
import GameScreen from "./screens/GameScreen";
import { useSocketStore } from "./store/useSocketStore";

export default function App() {
  const { currentScreen, setScreen, socket, roomCode, reconnect } = useSocketStore();

  useEffect(() => {
    if (!socket && roomCode) {
      reconnect();
    }
  }, [socket, roomCode, reconnect]);

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
}

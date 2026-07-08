import "./App.css";
import LandingPage from "./screens/LandingPage";
import LoginModal from "./screens/LoginModal";
import SelectPlayScreen from "./screens/SelectPlayScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";
import DriverScreen from "./screens/DriverScreen";
import NavigatorScreen from "./screens/NavigatorScreen";
import { useSocketStore } from "./store/useSocketStore";

export default function App() {
  const { currentScreen, role, setScreen } = useSocketStore();

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
      if (role === "navigator") {
        return <NavigatorScreen />;
      }
      return <DriverScreen />;
    default:
      return <LandingPage onStart={() => setScreen('login')} />;
  }
}

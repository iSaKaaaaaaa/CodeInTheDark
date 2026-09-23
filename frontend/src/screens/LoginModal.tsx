import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginModal() {
  const [error, setError] = useState("");

  const setScreen = useSocketStore((state) => state.setScreen);
  const loginWithGoogle = useSocketStore((state) => state.loginWithGoogle);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        if (tokenResponse.access_token) {
          await loginWithGoogle({ accessToken: tokenResponse.access_token });
        }
      } catch (err) {
        setError("Login failed. Please try again.");
      }
    },
    onError: () => {
      setError("Google Login was unsuccessful");
    },
  });

  return (
    <div
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out font-pixel"
      onClick={() => setScreen("landing")}
    >
      <h2
        className="text-[#fde68a] text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 md:mb-6 uppercase text-center relative z-10 font-bold tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
        style={{ textShadow: "4px 4px 0px #5c2e0b" }}
      >
        Code In The Dark
      </h2>

      <div
        className="relative w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[700px] lg:max-w-[800px] max-h-[75vh] md:max-h-[80vh] aspect-[4/3] flex flex-col items-center justify-center cursor-auto drop-shadow-2xl mx-auto"
        style={{
          backgroundImage: "url('/ui/score.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 2. Modal Close Button (UX Rule: Clear Exit): ใช้ไอคอน 'X' สากลที่มุมขวาบน เพื่อลดความซ้ำซ้อนของคำและจัดตำแหน่งได้เป๊ะกว่า */}
        <button
          className="absolute top-[8%] right-[8%] md:top-[12%] md:right-[12%] text-[#5c2e0b] text-4xl md:text-5xl font-bold hover:text-red-700 active:translate-y-1 transition-colors duration-100 z-10 drop-shadow-sm"
          onClick={() => setScreen("landing")}
          title="Close"
        >
          &#10006;
        </button>

        <div className="w-full h-full flex flex-col items-center justify-center px-[12%] sm:px-[15%] md:px-[18%] pt-[16%] sm:pt-[18%] md:pt-[20%] pb-[5%] gap-3 md:gap-5 -translate-y-5">
          <div className="text-center flex flex-col gap-1 md:gap-2">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center text-[#5c2e0b] font-bold uppercase tracking-widest drop-shadow-sm">
              Welcome, Explorer
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-center text-[#8b4513]">
              Please log in to continue
            </p>
          </div>

          {/* Custom Google Login Button with brown text, Google logo, and pixel theme */}
          <button
            onClick={() => googleLogin()}
            className="flex items-center justify-center gap-3 bg-[#492B0A] hover:bg-[#9E6023] text-[#EEEAE8] font-pixel font-bold text-lg sm:text-xl md:text-2xl px-6 py-3.5 rounded-xl border-b-4 border-r-4 border-[#5c2e0b] shadow-lg hover:brightness-105 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all duration-100 mt-2 md:mt-4 cursor-pointer"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {error && (
            <p className="text-red-700 font-bold bg-red-100/90 border-2 border-red-500 rounded-lg p-3 text-center text-xl shadow-sm w-full max-w-sm mt-4 backdrop-blur-sm animate-pulse">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

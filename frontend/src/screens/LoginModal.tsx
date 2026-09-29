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
      className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out font-pixel"
      onClick={() => setScreen("landing")}
    >
      {/* Container ����� Title & Modal ��������觡�ҧ�ͨ�ԧ� ��ШѴ��������� gap */}
      <div className="flex flex-col items-center justify-center gap-8 sm:gap-12 w-full max-w-[400px]">
        {/* Title */}
        <h2
          className="text-[#fde68a] text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-center relative z-10 font-bold tracking-widest leading-tight whitespace-nowrap"
          style={{
            textShadow:
              "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12, 0 6px 10px rgba(0,0,0,0.8)",
          }}
        >
          Code In The Dark
        </h2>

        {/* Parchment Modal */}
        <div
          className="relative w-full cursor-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Outer glow */}
          <div className="absolute -inset-3 bg-[#f59e0b]/15 rounded-3xl blur-2xl pointer-events-none" />

          {/* Wooden frame � top bar */}
          <div
            className="relative z-10 mx-3 h-4 sm:h-5 rounded-t-md"
            style={{
              background:
                "linear-gradient(180deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)",
              borderTop: "2px solid #A97B50",
              borderLeft: "2px solid #7A4E2D",
              borderRight: "2px solid #4A2510",
              boxShadow:
                "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)",
              }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
            <div className="absolute top-1/2 -translate-y-1/2 right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
          </div>

          {/* Parchment body */}
          <div
            className="relative z-10 mx-1.5 px-5 sm:px-7 pt-6 sm:pt-8 pb-5 sm:pb-7"
            style={{
              background:
                "linear-gradient(170deg, #F5E6C8 0%, #EDD9A3 30%, #E8D08E 60%, #DBBF78 100%)",
              borderLeft: "3px solid #B8944F",
              borderRight: "3px solid #9A7A3D",
              boxShadow: `
                inset 0 0 30px rgba(139, 99, 49, 0.15),
                inset 0 0 60px rgba(139, 99, 49, 0.08),
                4px 0 8px rgba(0,0,0,0.2),
                -4px 0 8px rgba(0,0,0,0.2),
                0 4px 12px rgba(0,0,0,0.3)
              `,
            }}
          >
            {/* Parchment texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: `
                radial-gradient(ellipse at 20% 50%, rgba(101,67,33,1) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(101,67,33,1) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 80%, rgba(101,67,33,1) 0%, transparent 45%)
              `,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: "inset 0 0 40px rgba(101,67,33,0.12)",
              }}
            />

            {/* Close button */}
            <button
              className="absolute top-1.5 right-2.5 text-[#8B5E3C] text-xl sm:text-2xl font-bold hover:text-[#C4553A] active:translate-y-0.5 transition-all duration-75 leading-none"
              onClick={() => setScreen("landing")}
              title="Close"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}
            >
              X
            </button>

            {/* Content */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-20">
              <div className="text-center flex flex-col gap-0.5">
                <p
                  className="text-xl sm:text-2xl md:text-3xl text-[#5c2e0b] font-bold uppercase tracking-widest"
                  style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.3)" }}
                >
                  Welcome
                </p>
                <p className="text-xs sm:text-sm md:text-base text-[#8b6840]">
                  Sign in to start the adventure
                </p>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#B8944F] opacity-60" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
              </div>

              {/* Custom Google Login Button */}
              <button
                onClick={() => googleLogin()}
                className="flex items-center justify-center gap-3 w-full bg-[#5c2e0b] hover:bg-[#9E6023] text-[#EEEAE8] font-pixel font-bold text-lg sm:text-xl px-6 py-3 rounded-xl border-b-[4px] border-r-[4px] border-t-[2px] border-l-[2px] border-[#382503] shadow-[0_4px_0px_#2a1b12] hover:brightness-105 active:border-b-0 active:border-r-0 active:translate-y-1 active:shadow-none transition-all duration-100 mt-2 cursor-pointer relative overflow-hidden"
              >
                <span className="absolute inset-0 border-t-[2px] border-l-[2px] border-white/10 rounded-lg pointer-events-none" />
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 shrink-0"
                  viewBox="0 0 24 24"
                >
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

              {/* Error */}
              {error && (
                <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 border-[#b91c1c] px-3 py-2 rounded-xl text-center text-sm sm:text-base font-bold shadow-md font-pixel">
                  ?? {error}
                </div>
              )}
            </div>
          </div>

          {/* Wooden frame � bottom bar */}
          <div
            className="relative z-10 mx-3 h-4 sm:h-5 rounded-b-md"
            style={{
              background:
                "linear-gradient(0deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)",
              borderBottom: "2px solid #4A2510",
              borderLeft: "2px solid #7A4E2D",
              borderRight: "2px solid #4A2510",
              boxShadow:
                "0 4px 8px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)",
              }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
            <div className="absolute top-1/2 -translate-y-1/2 right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
          </div>

          {/* Drop shadow */}
          <div className="absolute -bottom-2 left-6 right-6 h-4 bg-black/20 rounded-full blur-md -z-10" />
        </div>
      </div>
    </div>
  );
}

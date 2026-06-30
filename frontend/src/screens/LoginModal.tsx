import React from 'react';
import InputField from '../components/InputField';
import PixelButton from '../components/PixelButton';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({ onClose, onLogin }: LoginModalProps) {
  return (
    <div
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-in-out cursor-default"
      onClick={onClose}
    >
      <h2 className="text-black text-5xl md:text-7xl mb-10 drop-shadow-xl text-center relative z-10">
        Code In The Dark
      </h2>

      <div
        className="relative w-full max-w-[600px] h-[450px] md:max-w-[800px] md:h-[550px] flex flex-col items-center justify-center cursor-auto"
        // ม้วนกระดาษ
        style={{
          backgroundImage: "url('/score.png')",
          backgroundSize: '130% 130%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 left-10 text-black text-4xl font-bold hover:text-orange-700 transition-colors flex items-center gap-2 z-10 drop-shadow-sm"
          onClick={onClose}
        >
          <span>&#8592;</span>
        </button>

        <div className="w-full px-16 md:px-32 py-8 flex flex-col gap-6 mt-8">
          <InputField label="Username" />
          <InputField label="Password" type="password" />

          <div className="flex justify-center gap-8 mt-4">
            <PixelButton variant="parchment" className="rounded-full px-6 py-2 text-xl">
              Sign up
            </PixelButton>
            <PixelButton variant="orange" className="rounded-full px-6 py-2 text-xl" onClick={onLogin}>
              Log in
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
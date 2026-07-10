import React from 'react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'wood' | 'parchment' | 'orange';
  className?: string;
  disabled?: boolean;
}

// สไตล์พื้นฐานของปุ่มแยกตาม variant ที่ใช้ซ้ำในหลายหน้า
const variantStyles: Record<string, string> = {
  wood: 'bg-[#D2B48C] border-b-4 border-r-4 border-amber-900 text-black hover:brightness-110 active:border-b-0 active:border-r-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed',
  parchment: 'bg-amber-100 border-4 border-black text-black hover:bg-amber-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  orange: 'bg-orange-600 border-4 border-black text-white hover:bg-orange-700 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
};

export default function PixelButton({
  children,
  onClick,
  variant = 'wood',
  className = '',
  disabled = false,
}: PixelButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-pixel font-bold transition-all ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-black text-xl font-bold drop-shadow-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-amber-100/70 p-3 rounded-lg border-4 border-black text-black text-xl outline-none focus:bg-amber-100 focus:border-orange-600 transition-colors shadow-inner font-pixel"
      />
    </div>
  );
}
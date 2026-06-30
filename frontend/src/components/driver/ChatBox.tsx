import React, { useState } from "react";

interface ChatBoxProps {
  messages?: string[];
  onSendMessage?: (message: string) => void;
}

export default function ChatBox({
  messages = [],
  onSendMessage,
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      onSendMessage?.(inputValue);
      setInputValue(""); // เคลียร์ช่องพิมพ์หลังจากส่ง
    }
  };

  return (
    <div className="h-40 bg-black/80 rounded-xl border-4 border-black p-3 flex flex-col">
      <span className="text-white font-bold text-xl mb-2 tracking-wider">
        CHAT BOX
      </span>

      {/* พื้นที่แสดงข้อความแชท */}
      <div className="flex-1 overflow-y-auto mb-2 flex flex-col gap-1">
        {messages.map((msg, index) => (
          <div key={index} className="text-white text-sm">
            <span className="text-orange-500 font-bold">{">"} </span>
            {msg}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter the message"
        className="bg-black/50 border-2 border-gray-700 rounded-lg p-2 text-white outline-none focus:border-orange-500 transition-colors font-pixel"
      />
    </div>
  );
}

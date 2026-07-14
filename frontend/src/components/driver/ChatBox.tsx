import React, { useState, useEffect } from "react";
import { useSocketStore } from "../../store/useSocketStore";

interface ChatMessage {
  sender: string;
  text: string;
}

export default function ChatBox() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { socket, username } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    // รีเซ็ต chat เมื่อมีการสุ่มแมพใหม่และเริ่มเกม
    const handleStartGame = () => {
      setMessages([]);
    };

    socket.on("chat_message", handleMessage);
    socket.on("start_game", handleStartGame);

    return () => {
      socket.off("chat_message", handleMessage);
      socket.off("start_game", handleStartGame);
    };
  }, [socket]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const newMsg = { sender: username, text: inputValue };
      // Optimistically add to own screen
      setMessages((prev) => [...prev, newMsg]);
      // Emit to server
      socket?.emit("chat_message", newMsg);
      setInputValue("");
    }
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-56 bg-black/80 rounded-xl border-4 border-black p-3 flex flex-col shadow-2xl">
      <span className="text-white font-bold text-xl mb-2 tracking-wider">
        CHAT BOX
      </span>

      <div className="flex-1 overflow-y-auto mb-2 flex flex-col gap-1">
        {messages.map((msg, index) => (
          <div key={index} className="text-white text-sm">
            <span className="text-orange-500 font-bold">{msg.sender}: </span>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
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

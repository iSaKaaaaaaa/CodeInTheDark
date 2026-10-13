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

    // รีเซ็ต chat เมื่อเริ่มเกมใหม่ (จากหน้า lobby)
    const handleStartGame = () => {
      setMessages([]);
    };

    // รีเซ็ต chat เมื่อกด Restart / Next (Navigator ได้รับ reset: true จาก Driver)
    const handleSyncState = (state: any) => {
      if (state.reset) {
        setMessages([]);
      }
    };

    // รีเซ็ต chat เมื่อกด Restart / Next (ทั้ง Driver และ Navigator ได้รับ)
    const handleResetChat = () => {
      setMessages([]);
    };

    // รีเซ็ต chat เมื่อกลับ lobby
    const handleReturnToLobby = () => {
      setMessages([]);
    };

    socket.on("chat_message", handleMessage);
    socket.on("start_game", handleStartGame);
    socket.on("sync_game_state", handleSyncState);
    socket.on("reset_chat", handleResetChat);
    socket.on("return_to_lobby", handleReturnToLobby);

    return () => {
      socket.off("chat_message", handleMessage);
      socket.off("start_game", handleStartGame);
      socket.off("sync_game_state", handleSyncState);
      socket.off("reset_chat", handleResetChat);
      socket.off("return_to_lobby", handleReturnToLobby);
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
    <div className="h-64 md:h-72 bg-black/85 rounded-xl border-4 border-black p-3.5 flex flex-col shadow-2xl">
      <span className="text-white font-bold text-3xl md:text-4xl mb-2 tracking-widest font-pixel">
        CHAT BOX
      </span>

      <div className="flex-1 overflow-y-auto mb-2.5 flex flex-col gap-1.5 pr-1">
        {messages.map((msg, index) => {
          const isSystem = msg.sender === "[SYSTEM]";
          const isMe = msg.sender === username;

          if (isSystem) {
            return (
              <div key={index} className="text-yellow-400 text-xl md:text-2xl font-pixel italic py-0.5 leading-snug">
                <span className="font-bold">⚠ </span>
                {msg.text}
              </div>
            );
          }

          return (
            <div key={index} className="text-white text-2xl md:text-3xl font-pixel leading-snug">
              <span className={`font-bold ${isMe ? 'text-sky-400' : 'text-orange-400'}`}>
                {msg.sender}{isMe && " (You)"}:{" "}
              </span>
              <span className="text-gray-100">{msg.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message (English / ไทย)..."
        className="bg-black/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white text-xl md:text-2xl outline-none focus:border-orange-500 transition-colors font-pixel placeholder:text-gray-500"
      />
    </div>
  );
}

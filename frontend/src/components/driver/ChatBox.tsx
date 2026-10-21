import React, { useState, useEffect } from "react";
import { useSocketStore } from "../../store/useSocketStore";

interface ChatMessage {
  sender: string;
  text: string;
}

interface ChatBoxProps {
  onTutorialChatSent?: () => void;
  mockMessage?: { sender: string; text: string } | null;
}

export default function ChatBox({ onTutorialChatSent, mockMessage }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { socket, username } = useSocketStore();

  // Listen for mock messages (e.g. from tutorial simulations)
  useEffect(() => {
    if (mockMessage) {
      setMessages((prev) => [...prev, mockMessage]);
    }
  }, [mockMessage]);

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
      // Notify tutorial
      onTutorialChatSent?.();
    }
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex-1 bg-black/90 rounded-2xl border-4 border-[#382503] p-2.5 sm:p-3 flex flex-col shadow-2xl min-h-0 shrink-0 font-pixel">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-widest uppercase flex items-center gap-2"
          style={{ textShadow: "1px 1px 0px #000" }}
        >
          CHAT BOX
        </span>
        <span className="text-gray-400 text-xs sm:text-sm tracking-wider">
          (Driver ↔ Navigator)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 flex flex-col gap-1 pr-1 min-h-0">
        {messages.map((msg, index) => {
          const isSystem = msg.sender === "[SYSTEM]";
          const isMe = msg.sender === username;
          const isMock = msg.sender.includes("จำลอง");

          if (isSystem) {
            return (
              <div
                key={index}
                className="text-yellow-400 text-lg sm:text-xl font-bold italic leading-snug shrink-0 break-words py-0.5"
                style={{ textShadow: "1px 1px 0 #000" }}
              >
                <span className="font-bold">⚠ </span>
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`text-base sm:text-lg md:text-xl font-bold leading-snug shrink-0 break-words py-0.5 ${
                isMock ? "bg-amber-950/40 px-2 rounded border border-amber-600/40" : ""
              }`}
              style={{ textShadow: "1px 1px 0px #000" }}
            >
              <span
                className={`font-black tracking-wide ${
                  isMock
                    ? "text-amber-300"
                    : isMe
                      ? "text-sky-400"
                      : "text-orange-400"
                }`}
              >
                {msg.sender}
                {isMe && " (คุณ)"}:{" "}
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
        placeholder="พิมพ์ข้อความ (บอกทาง / เตือนกับดัก)..."
        className="bg-black/70 border-2 border-gray-600 focus:border-amber-500 rounded-xl px-3 py-1.5 text-white text-lg sm:text-xl font-bold outline-none transition-colors placeholder:text-gray-500 shrink-0 tracking-wide"
        style={{ textShadow: "1px 1px 0 #000" }}
      />
    </div>
  );
}

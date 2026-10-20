import React, { useState, useEffect, useRef } from "react";
import { useSocketStore } from "../../store/useSocketStore";

interface ChatMessage {
  sender: string;
  text: string;
}

interface ChatBoxProps {
  className?: string;
}

export default function ChatBox({ className = "" }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { socket, username } = useSocketStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    const newMsg = { sender: username, text };
    setMessages((prev) => [...prev, newMsg]);
    socket?.emit("chat_message", newMsg);
    if (!textToSend) {
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      className={`h-full w-full bg-black/85 backdrop-blur-sm rounded-xl border-4 border-[#333] p-3 flex flex-col shadow-2xl min-h-0 ${className}`}
    >
      {/* Header */}
      <div className="pb-2 mb-2 border-b-2 border-neutral-800 shrink-0">
        <h2
          className="text-[#fde68a] text-lg sm:text-xl font-bold font-pixel tracking-wider uppercase"
          style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
        >
          Chat Box
        </h2>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto mb-2 flex flex-col gap-1.5 pr-1 min-h-0"
        style={{ fontFamily: '"Chakra Petch", sans-serif' }}
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-neutral-500">
            <span className="text-2xl mb-1 opacity-60">📜</span>
            <p className="text-xs sm:text-sm font-medium">Coordinate with your partner here!</p>
            <p className="text-[11px] opacity-75 mt-0.5">Type a message below.</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isSystem = msg.sender === "[SYSTEM]";
          const isMe = msg.sender === username;

          if (isSystem) {
            return (
              <div
                key={index}
                className="text-yellow-400 text-xs md:text-sm font-bold italic leading-snug shrink-0 break-words py-1 px-2 bg-yellow-950/30 rounded border-l-2 border-yellow-500"
              >
                <span className="font-bold">⚠ </span>
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`text-xs md:text-sm font-semibold leading-snug shrink-0 break-words py-1 px-2 rounded-lg ${
                isMe
                  ? "bg-sky-950/40 border border-sky-800/50 ml-2"
                  : "bg-orange-950/40 border border-orange-800/50 mr-2"
              }`}
            >
              <div className="text-[11px] mb-0.5">
                <span
                  className={`font-bold font-pixel tracking-wide ${
                    isMe ? "text-sky-400" : "text-orange-400"
                  }`}
                >
                  {msg.sender}
                  {isMe && " (You)"}
                </span>
              </div>
              <span className="text-gray-100 font-medium text-xs sm:text-sm">
                {msg.text}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box + Send Button */}
      <div className="flex gap-1.5 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message (Eng / ไทย)..."
          style={{ fontFamily: '"Chakra Petch", sans-serif' }}
          className="flex-1 min-w-0 bg-black/60 border-2 border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs sm:text-sm font-medium outline-none focus:border-orange-500 transition-colors placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          className="bg-[#b45309] hover:bg-[#d97706] border-b-2 border-r-2 border-[#382503] text-white font-pixel px-3 py-1.5 rounded-lg active:translate-y-0.5 shadow-sm text-xs sm:text-sm uppercase tracking-wider shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}

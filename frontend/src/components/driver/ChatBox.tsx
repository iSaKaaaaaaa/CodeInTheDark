import React, { useState, useEffect, useRef } from "react";
import { useSocketStore } from "../../store/useSocketStore";

interface ChatMessage {
  sender: string;
  text: string;
  role?: string;
  timestamp?: string;
}

interface ChatBoxProps {
  onTutorialChatSent?: () => void;
  onValidateTutorialChat?: (text: string) => { valid: boolean; feedback?: string };
  isTutorialActive?: boolean;
  mockMessage?: { sender: string; text: string } | null;
  /** Increment to clear the local chat log (e.g. when tutorial ends) */
  resetSignal?: number;
}

export default function ChatBox({
  onTutorialChatSent,
  onValidateTutorialChat,
  isTutorialActive = false,
  mockMessage,
  resetSignal = 0,
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { socket, username, role } = useSocketStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear chat (and any half-typed input) whenever the parent bumps resetSignal
  useEffect(() => {
    if (resetSignal > 0) {
      setMessages([]);
      setInputValue("");
    }
  }, [resetSignal]);

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

    // Reset chat on new game / restart / return to lobby
    const handleStartGame = () => setMessages([]);
    const handleSyncState = (state: any) => {
      if (state.reset) setMessages([]);
    };
    const handleResetChat = () => setMessages([]);
    const handleReturnToLobby = () => setMessages([]);

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
      const trimmed = inputValue.trim();

      // Tutorial Interactive Validation Mode
      if (isTutorialActive && onValidateTutorialChat) {
        const validation = onValidateTutorialChat(trimmed);
        if (!validation.valid) {
          // Display player's attempt and system feedback locally
          setMessages((prev) => [
            ...prev,
            { sender: username || "Player", text: trimmed },
            {
              sender: "[SYSTEM]",
              text: validation.feedback || "Invalid response. Please follow the mission objective.",
            },
          ]);
          setInputValue("");
          return;
        }

        // Valid tutorial response — keep in local chat, trigger tutorial advance
        setMessages((prev) => [
          ...prev,
          { sender: username || "Player", text: trimmed },
        ]);
        setInputValue("");
        onTutorialChatSent?.();
        return;
      }

      // Regular In-Game Chat Flow
      const newMsg: ChatMessage = {
        sender: username || "Player",
        text: trimmed,
        role: role || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Optimistically add to own screen
      setMessages((prev) => [...prev, newMsg]);

      // Emit to server for partner
      socket?.emit("chat_message", newMsg);
      setInputValue("");
      onTutorialChatSent?.();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex-1 bg-black/90 rounded-2xl border-4 border-[#382503] p-2.5 sm:p-3 flex flex-col shadow-2xl min-h-0 shrink-0 font-game-body">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#5c2e0b]/50">
        <span
          className="text-[#fde68a] font-bold text-base sm:text-lg md:text-xl tracking-wider uppercase flex items-center gap-2 font-game-sub"
          style={{ textShadow: "1px 1px 0px #000" }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          CHAT LOG
        </span>
        <span className="text-gray-400 text-xs sm:text-sm tracking-wide font-game-sub">
          DRIVER ↔ NAVIGATOR
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-2 flex flex-col gap-1.5 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-500 font-game-sub text-xs sm:text-sm italic">
            <span>No messages yet.</span>
            <span>Coordinate with your partner to solve the dungeon!</span>
          </div>
        )}

        {messages.map((msg, index) => {
          const isSystem = msg.sender === "[SYSTEM]" || msg.sender.startsWith("[SYSTEM");
          const isMe = msg.sender === username;
          const isMock = msg.sender.includes("AI Partner") || msg.sender.includes("จำลอง");

          // Distinct High-Visibility System Notification
          if (isSystem) {
            return (
              <div
                key={index}
                className="bg-amber-950/70 border border-amber-500/70 rounded-lg p-2 my-0.5 shadow-md shrink-0 break-words"
              >
                <div className="flex items-center gap-1.5 font-game-sub font-bold text-amber-400 text-[11px] uppercase tracking-wider mb-0.5">
                  <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded font-black text-[9px]">
                    SYS
                  </span>
                  <span>SYSTEM NOTIFICATION</span>
                </div>
                <div className="text-amber-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Player Messages
          return (
            <div
              key={index}
              className={`text-xs sm:text-sm font-medium leading-snug shrink-0 break-words py-1 px-2.5 rounded-lg border ${
                isMock
                  ? "bg-amber-950/40 border-amber-700/50 text-amber-100"
                  : isMe
                    ? "bg-sky-950/50 border-sky-600/50 text-sky-100 ml-2"
                    : "bg-[#251508]/70 border-[#8B5E3C]/60 text-orange-100 mr-2"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span
                  className={`font-game-sub font-bold text-[11px] uppercase tracking-wide px-1.5 py-0.2 rounded ${
                    isMock
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : isMe
                        ? "bg-sky-500/20 text-sky-300 border border-sky-400/40"
                        : "bg-orange-500/20 text-orange-300 border border-orange-400/40"
                  }`}
                >
                  {msg.sender}
                  {isMe && " (YOU)"}
                </span>
                {msg.timestamp && (
                  <span className="text-[10px] text-gray-500 font-game-sub">
                    {msg.timestamp}
                  </span>
                )}
              </div>
              <div className="text-gray-100 font-game-body text-xs sm:text-sm">
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type instructions, coordinates, or warnings..."
        className="bg-black/80 border-2 border-[#5c2e0b] focus:border-amber-400 rounded-xl px-3 py-2 text-white text-xs sm:text-sm md:text-base font-semibold outline-none transition-colors placeholder:text-gray-500 shrink-0 tracking-wide font-game-body"
        style={{ textShadow: "1px 1px 0 #000" }}
      />
    </div>
  );
}

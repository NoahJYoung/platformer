import { useEffect, useState, useRef } from "react";
import type { GameEngine } from "../../engine/game-engine";
import type { GameMessage } from "../../engine/message-manager";

interface MessageLogProps {
  gameEngine: GameEngine | null;
}

export const MessageLog = ({ gameEngine }: MessageLogProps) => {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = gameEngine?.messageManager.subscribe(setMessages);
    return unsubscribe;
  }, [gameEngine]);

  useEffect(() => {
    if (isAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAutoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setIsAutoScroll(isAtBottom);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getMessageColor = (type: GameMessage["type"]) => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "danger":
        return "#ff5722";
      case "special":
        return "#2196f3";
      case "info":
      default:
        return "#e0e0e0";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        right: "4px",
        width: "300px",
        background: "rgba(0, 0, 0, 0.85)",
        border: "1px solid #444",
        borderRadius: "2px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "4px 6px",
          borderBottom: isCollapsed ? "none" : "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "6px 6px 0 0",
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}>
            MESSAGE LOG
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#888", fontSize: "16px" }}>
            {isCollapsed ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      {!isCollapsed && (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={{
            maxHeight: "100px",
            overflowY: "auto",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                color: "#666",
                fontSize: "12px",
                textAlign: "center",
                padding: "4px",
                fontStyle: "italic",
              }}
            >
              No messages yet...
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  gap: "8px",
                  fontSize: "11px",
                  lineHeight: "1.4",
                  padding: "4px 6px",
                  borderRadius: "3px",
                  background: "rgba(255, 255, 255, 0.02)",
                }}
              >
                <span
                  style={{
                    color: "#666",
                    flexShrink: 0,
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {formatTime(message.timestamp)}
                </span>
                <span
                  style={{
                    color: getMessageColor(message.type),
                    wordBreak: "break-word",
                  }}
                >
                  {message.text}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

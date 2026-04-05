"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Session } from "@/lib/interfaces";
import { getRemaining } from "@/app/action/chat/remaining";
import Aside from "./aside";
const STORAGE_KEY = "chat_sessions";

export default function Chat() {
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<{
    [key: string]: boolean;
  }>({});
  const { messages, setMessages, sendMessage, status } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const refreshRemaining = useCallback(async () => {
    const latest = await getRemaining();
    setRemaining(latest ?? 0);
  }, []);

  // 提取标题
  const extractTitle = (msgs: Message[]) => {
    const firstUserMsg = msgs.find((m) => m.role === "user");
    if (firstUserMsg) {
      const text =
        firstUserMsg.parts?.find((p) => p.type === "text")?.text || "";
      return text.slice(0, 24) || "新对话";
    }
    return "新对话";
  };
  const addChatMessage = useCallback((session: Session) => {
    setSessions((prev) => {
      const updated = [session, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setCurrentSessionId(session.id);
    setMessages([]);
    setIsThinkingMode(false);
  }, [setMessages]);


  // 加载会话
  const loadSession = useCallback(
    (sessionId: string) => {
        const session: Session | undefined = sessions.find((s) => s.id === sessionId);
        if (session) {
          setCurrentSessionId(sessionId);
          
          setMessages(session.messages);
          setIsThinkingMode(session.isThinkingMode);
        };
    },
    [setMessages, sessions],
  );

  // 删除会话
  const deleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (currentSessionId === sessionId) {
          if (updated.length > 0) {
            const nextSession = updated[0];
            setCurrentSessionId(nextSession.id);
            
            setMessages(nextSession.messages);
            setIsThinkingMode(nextSession.isThinkingMode);
          }
        }
        return updated;
      });
    },
    [currentSessionId, setMessages],
  );

  // 初始化加载历史会话
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          const lastSession = parsed[0];
          setCurrentSessionId(lastSession.id);
          
          setMessages(lastSession.messages as any);
          setIsThinkingMode(lastSession.isThinkingMode);
        }
      } catch (e) {
        console.error("加载历史记录失败:", e);
        // 创建新会话作为备用
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 消息变化时自动保存当前会话
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: messages as Message[],
                title: extractTitle(messages as Message[]),
              }
            : s,
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentSessionId]);

  // 初始化和每轮对话结束后刷新剩余次数
  useEffect(() => {
    if (status === "ready" || status === "error") {
      refreshRemaining();
    }
  }, [status, refreshRemaining]);
  // 思考模式变化时保存
  useEffect(() => {
    if (currentSessionId) {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === currentSessionId ? { ...s, isThinkingMode } : s,
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [isThinkingMode, currentSessionId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(
      {
        text: input,
      },
      {
        body: {
          isThinkingMode,
        },
      },
    );
    setInput("");
  };
  return (
    <main className="h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex h-full max-w-7xl gap-4 p-4">
        <Aside 
        addChatMessage={addChatMessage} 
        sessions={sessions}
        loadSession={loadSession}
        deleteSession={deleteSession}
        currentSessionId={currentSessionId}
         />

        <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-5 py-4">
            <h1 className="text-xl font-semibold">AI 聊天助手</h1>

            <p className="mt-1 text-sm text-slate-500">
              {sessions.find((s) => s.id === currentSessionId)?.title ||
                "新对话"}
            </p>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                <p className="text-sm text-slate-500">
                  开始输入问题，开启新对话
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%]">
                      {/* 思考过程展示 */}
                      {m.parts.some((p) => p.type === "reasoning") && (
                        <div className="mb-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedThinking((prev) => ({
                                ...prev,
                                [m.id]: !prev[m.id],
                              }))
                            }
                            className="flex w-full items-center gap-2 text-xs font-semibold text-purple-700 hover:text-purple-900"
                          >
                            <span>{expandedThinking[m.id] ? "▼" : "▶"}</span>
                            <span>🧠 思考过程</span>
                          </button>
                          {expandedThinking[m.id] && (
                            <div className="mt-2 text-xs text-purple-600 whitespace-pre-wrap">
                              {m.parts
                                .filter((p) => p.type === "reasoning")
                                .map((p) => ("text" in p ? p.text : ""))
                                .join("\n")}
                            </div>
                          )}
                        </div>
                      )}
                      {/* 正常回复 */}
                      <div
                        className={`rounded-2xl px-4 py-3 leading-6 shadow-sm ${
                          m.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="mb-1 text-xs font-semibold opacity-80">
                          {m.role === "user" ? "你" : "AI"}
                        </p>
                        {m.parts.map((part, idx) =>
                          part.type === "text" ? (
                            <p key={idx} className="whitespace-pre-wrap">
                              {part.text}
                            </p>
                          ) : null,
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-2">
              <button
                type="button"
                onClick={() => setIsThinkingMode((prev) => !prev)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                  isThinkingMode
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isThinkingMode ? "🧠 深度思考" : "⚡ 标准模式"}
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  remaining === null
                    ? "正在获取剩余次数..."
                    : remaining > 0
                    ? `输入你的问题...（剩余 ${remaining} 次）`
                    : "今日聊天次数已用完"
                }
                className="h-10 flex-1 bg-transparent px-2 text-sm outline-none"
              />

              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  (status !== "ready" && status !== "error") ||
                  remaining === null ||
                  remaining <= 0
                }
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status !== "ready" && status !== "error"
                  ? "发送中..."
                  : "发送"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

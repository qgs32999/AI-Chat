"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [userHighlights, setUserHighlights] = useState("");
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    sendMessage({
      text: JSON.stringify({
        jobDescription,
        userHighlights,
      }),
    });
  };
  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">AI 求职信生成器</h1>

        {/* 输入区域 */}
        <form
          onSubmit={onSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow"
        >
          <div>
            <label className="block text-sm font-medium">职位描述 (JD)</label>
            <textarea
              className="w-full p-2 border rounded mt-1"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">你的亮点</label>
            <textarea
              className="w-full p-2 border rounded mt-1"
              rows={4}
              value={userHighlights}
              onChange={(e) => setUserHighlights(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status !== "error" && status !== "ready"}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {status !== "error" && status !== "ready"
              ? "生成中..."
              : "生成求职信"}
          </button>
        </form>

        {/* 流式输出区域 */}
        <div className="h-[40vh] w-full overflow-y-auto rounded-lg border bg-white p-3">
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold opacity-80">
                    {m.role === "user" ? "你" : "AI"}
                  </p>

                  {/* v6 正确写法：遍历 parts */}
                  {m.parts.map((part, idx) =>
                    part.type === "text" ? (
                      <p key={idx} className="whitespace-pre-wrap leading-6">
                        {part.text}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef}></div>
        </div>
      </div>
    </main>
  );
}

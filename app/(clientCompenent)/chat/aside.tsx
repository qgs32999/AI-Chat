import type { Session } from "@/lib/interfaces";
export default function Aside({
    addChatMessage, 
    sessions, 
    currentSessionId, 
    loadSession, 
    deleteSession
}: {
        addChatMessage: (session: Session) => void;
    sessions: Session[];
    currentSessionId: string | null;
    loadSession: (sessionId: string) => void;
    deleteSession: (sessionId: string, e: React.MouseEvent<HTMLButtonElement>) => void;

}) {
  // 创建新会话
  const createNewSession = () => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      title: "新对话",
      messages: [],
      createdAt: Date.now(),
      isThinkingMode: false,
    };
    addChatMessage(newSession);
  };
  return (
    <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex md:flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">对话历史</h2>
        <button
          type="button"
          onClick={createNewSession}
          className="rounded px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 transition"
          title="新建对话"
        >
          +
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
        {sessions.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            暂无对话记录
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              onClick={() => loadSession(session.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  loadSession(session.id);
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition group flex items-center justify-between ${
                currentSessionId === session.id
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              title={session.title}
            >
              <span className="truncate flex-1">{session.title}</span>
              <button
                type="button"
                onClick={(e) => deleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 ml-1 text-red-500 hover:text-red-700 transition text-xs"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

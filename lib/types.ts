// 1. 定义请求体的接口
export interface GenerateRequest {
  jobDescription: string;
  userHighlights: string;
  tone?: "formal" | "casual" | "enthusiastic";
}
// 2. 定义流式响应的泛型结构 (虽然 SDK 封装了，但理解这个很重要)
// 这里的 T 代表每个流式块的数据类型
export interface StreamResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 3. 定义 AI 消息的接口
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
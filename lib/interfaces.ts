/**
 * 聊天应用的接口定义
 */

import type { UIMessage } from "ai";

export type Message = UIMessage;

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  isThinkingMode: boolean;
}

/**
 * 聊天 API 请求体
 */
export interface ChatRequest {
  messages: Message[];
  modelName?: string;
  isThinkingMode?: boolean;
}

/**
 * 思考内容
 */
export interface ThinkingContent {
  type: "thinking" | "text";
  content: string;
}

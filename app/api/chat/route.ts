import { deepseek } from "@ai-sdk/deepseek";
import { NextRequest } from "next/server";
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  validateUIMessages,
} from "ai";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { CookieParams } from "@/lib/types";
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");
    let cookieParams: string;
    // //判断是否存在cookie
    if (authCookie) {
      const cookieParamValue: CookieParams = JSON.parse(authCookie.value);
      // // 判断cookie是否过期, 如果过期就刷新cookie
      if (Date.now() > cookieParamValue.expires) {
        cookieParams = JSON.stringify({
          id: cookieParamValue.id,
          remaining: process.env.REMAINING_QUOTA ? Number(process.env.REMAINING_QUOTA) : 9,
          expires: Date.now() + 24 * 60 * 60 * 1000,
        });
      } else if (cookieParamValue.remaining <= 0) {
        return new Response(
          JSON.stringify({ error: "No remaining interactions" }),
          {
            status: 403,
          },
        );
      } else {
        //剩余次数递减
        cookieParams = JSON.stringify({
          id: cookieParamValue.id,
          remaining: cookieParamValue.remaining - 1,
          expires: cookieParamValue.expires,
        });
      }
    } else {
      cookieParams = JSON.stringify({
        id: uuidv4(),
        //剩余次数
        remaining: process.env.REMAINING_QUOTA ? Number(process.env.REMAINING_QUOTA) : 9,
        //过期时间，24小时后
        expires: Date.now() + 24 * 60 * 60 * 1000,
      });
    }
    const reqResult = await req.json();
    const { messages, modelName, isThinkingMode } = reqResult as {
      messages?: UIMessage[];
      modelName?: string;
      isThinkingMode?: boolean;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
      });
    }

    const validatedMessages = await validateUIMessages({ messages });
    const modelMessages = await convertToModelMessages(validatedMessages);

    // 默认使用稳定可用的聊天模型，深度思考模式切换到推理模型
    const selectedModel =
      modelName || (isThinkingMode ? "deepseek-reasoner" : "deepseek-chat");

    const result = await streamText({
      model: deepseek(selectedModel),
      messages: modelMessages,
      // 允许 thinking 内容在响应中显示
      // experimental_repairGenerics: true,
    });

    // 刷新cookie
    cookieStore.set("auth", cookieParams, { httpOnly: true, secure: false });
    return result.toUIMessageStreamResponse();
  } catch (e) {
    console.error("Stream error:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

import { deepseek } from "@ai-sdk/deepseek";
import { NextRequest } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { GenerateRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // 1. 解析请求体，利用接口进行类型约束（运行时仍需校验，但 TS 会提示）
    const { messages } = await req.json();
    // 取出body中messages中最后一条数据
    const message: GenerateRequest = JSON.parse(messages[messages.length - 1].parts[0].text);
    
    // 2. 简单校验
    // if (!body.jobDescription || !body.userHighlights) {
    //   return new Response(JSON.stringify({ error: "Missing fields" }), {
    //     status: 400,
    //   });
    // }
    // 3. 调用 AI SDK 的 streamText (底层就是 Async Iterable)
    // 这里体现了异步生成器的概念
    const result = streamText({
      model: deepseek("deepseek-chat"),
    //   messages,
      prompt: `请根据以下职位描述和用户亮点，写一封求职信。
      
      职位描述：
      ${message.jobDescription || '前端开发'}
      
      用户亮点：
      ${message.userHighlights || 'react、next.js、vue'}
      
      语气：
      formal`,
    });
    return result.toUIMessageStreamResponse();
  } catch (e) {
    console.error('Stream error:', e);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
  
}

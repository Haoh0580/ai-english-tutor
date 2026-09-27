const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export type ChatMessage = { role: string; content: string };

// 呼叫 OpenAI，要求回傳 JSON 物件並解析後回傳
export async function callOpenAIJson<T>(
  messages: ChatMessage[],
  { temperature = 0.7 }: { temperature?: number } = {}
): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as T;
}

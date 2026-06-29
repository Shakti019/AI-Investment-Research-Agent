import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing.");
    }

    client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }

  return client;
}

export async function callLLM(prompt: string): Promise<string> {
  const openai = getClient();

  try {
    console.log("🚀 Sending request...");

    const response = await openai.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    console.log("========== FULL RESPONSE ==========");
    console.dir(response, { depth: null });
    console.log("===================================");

    const text = response.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No text returned.");
    }

    return text;
  } catch (err) {
    console.error("OpenRouter Error:");
    console.error(err);
    throw err;
  }
}

export function parseJSON<T>(raw: string): T {
  console.log("RAW:", raw);

  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("No JSON found.");
  }

  return JSON.parse(match[0]) as T;
}
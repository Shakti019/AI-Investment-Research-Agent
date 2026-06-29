// app/api/test/route.ts
import { callLLM } from "@/services/llm";
import { NextResponse } from "next/server";

export async function GET() {
    const prompt = `You are a test agent. Return a simple JSON response with a message.`;

    try {
        const raw = await callLLM(prompt);
        const response = JSON.parse(raw);
        return NextResponse.json({ response });
    }catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Test agent failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
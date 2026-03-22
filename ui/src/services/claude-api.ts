// Claude API client for CIVION V1
// Runs entirely in the browser using the user's own API key

import Anthropic from "@anthropic-ai/sdk";

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Claude API key is required");
    }
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * Generate a response from Claude (non-streaming).
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt || "You are a helpful AI assistant.",
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = message.content.find(
        (block) => block.type === "text"
      );
      return (textBlock as { type: "text"; text: string })?.text || "";
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 401) {
        throw new Error("Invalid Claude API key");
      }
      throw error;
    }
  }

  /**
   * Stream a response from Claude, calling onToken for each chunk.
   */
  async generateStream(
    prompt: string,
    systemPrompt: string,
    onToken: (token: string) => void
  ): Promise<string> {
    let accumulated = "";

    const stream = this.client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    stream.on("text", (text) => {
      accumulated += text;
      onToken(text);
    });

    await stream.finalMessage();
    return accumulated;
  }

  /**
   * Quick connectivity test.
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generate("Say 'OK' in one word only.");
      return response.toLowerCase().includes("ok");
    } catch {
      return false;
    }
  }
}

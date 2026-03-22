// Gemini API client for CIVION V1
// Runs entirely in the browser using the REST API

export class GeminiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Generate a response from Gemini (non-streaming).
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    const payload: any = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid Gemini API key");
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Stream a response from Gemini, calling onToken for each chunk.
   */
  async generateStream(
    prompt: string,
    systemPrompt: string,
    onToken: (token: string) => void
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const payload: any = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid Gemini API key");
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulated = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (let line of lines) {
          line = line.trim();
          if (line.startsWith("data:")) {
            const dataStr = line.slice(5).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                accumulated += text;
                onToken(text);
              }
            } catch (e) {
              // Ignore incomplete JSON chunks when parsing SSE
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

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

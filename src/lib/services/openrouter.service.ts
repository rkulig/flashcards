/**
 * OpenRouter Service - minimalna implementacja
 */

// Typy
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  responseFormat?: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
  modelName?: string;
  params?: Record<string, unknown>;
}

export interface ChatResponse {
  data: unknown;
  raw: unknown;
}

/**
 * Serwis do komunikacji z API OpenRouter
 */
export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultParams: Record<string, unknown>;

  /**
   * Tworzy nową instancję OpenRouterService
   */
  constructor({
    apiKey,
    baseUrl = "https://openrouter.ai/api/v1",
    defaultModel = "gpt-4o-mini",
    defaultParams = { temperature: 0.7, top_p: 0.9, max_tokens: 1000 },
  }: {
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
    defaultParams?: Record<string, unknown>;
  }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    this.defaultParams = defaultParams;

    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }

  /**
   * Wysyła zapytanie chat completion do API OpenRouter
   */
  async chatCompletion(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    // Budowanie payloadu
    const payload: Record<string, unknown> = {
      model: options?.modelName || this.defaultModel,
      messages,
      ...this.defaultParams,
      ...options?.params,
    };

    // Dodanie response_format jeśli określony
    if (options?.responseFormat) {
      payload.response_format = {
        type: options.responseFormat.type,
        json_schema: options.responseFormat.json_schema,
      };
    }

    try {
      // Wysłanie zapytania
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const rawResponse = await response.json();

      // Podstawowa walidacja
      if (!rawResponse?.choices?.length || !rawResponse.choices[0].message?.content) {
        throw new Error("Invalid response from OpenRouter API");
      }

      // Próba parsowania JSON jeśli odpowiedź wygląda jak JSON
      const content = rawResponse.choices[0].message.content;
      let data: unknown = content;

      if (content.trim().startsWith("{")) {
        try {
          data = JSON.parse(content);
        } catch {
          // Jeśli nie udało się sparsować, używamy surowej odpowiedzi
          data = content;
        }
      }

      return {
        data,
        raw: rawResponse,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error during OpenRouter API call");
    }
  }

  /**
   * Pobiera listę wspieranych modeli z API OpenRouter
   */
  async getSupportedModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((model: { id: string }) => model.id);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error while fetching models");
    }
  }

  /**
   * Ustawia domyślny model dla zapytań chat completion
   */
  setDefaultModel(modelName: string): void {
    this.defaultModel = modelName;
  }

  /**
   * Ustawia domyślne parametry dla zapytań chat completion
   */
  setDefaultParams(params: Record<string, unknown>): void {
    this.defaultParams = { ...this.defaultParams, ...params };
  }
}

// Eksport domyślnej instancji
export const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY as string,
  baseUrl: (import.meta.env.OPENROUTER_BASE_URL as string) || undefined,
  defaultModel: (import.meta.env.OPENROUTER_DEFAULT_MODEL as string) || undefined,
});

export default openRouterService;

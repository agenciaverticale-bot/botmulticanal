import { invokeLLM } from "../_core/llm";
import { getMessagesByConversation } from "../db";

/**
 * Gera uma sugestão de resposta baseada no contexto da conversa
 */
export async function generateResponseSuggestion(
  conversationId: number,
  currentMessage: string,
  contactName?: string
): Promise<string | null> {
  try {
    // Buscar últimas 5 mensagens para contexto
    const conversationHistory = await getMessagesByConversation(conversationId, 5);

    // Montar histórico formatado
    const historyText = conversationHistory
      .map((msg: any) => {
        const sender = msg.direction === "inbound" ? (contactName || "Cliente") : "Você";
        return `${sender}: ${msg.content}`;
      })
      .join("\n");

    const prompt = `Você é um assistente de atendimento ao cliente profissional e empático.

Contexto da conversa:
${historyText}

Última mensagem do cliente:
${currentMessage}

Gere uma sugestão de resposta profissional, empática e concisa (máximo 2 parágrafos, aproximadamente 100-150 palavras).
A resposta deve ser natural e apropriada para comunicação via WhatsApp ou Instagram.
Não inclua saudações genéricas como "Olá" ou "Tudo bem?", apenas a resposta direta.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de atendimento ao cliente que gera sugestões de resposta profissionais e empáticas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const suggestion = response.choices?.[0]?.message?.content;
    return typeof suggestion === "string" ? suggestion : null;
  } catch (error) {
    console.error("[LLM] Erro ao gerar sugestão:", error);
    return null;
  }
}

/**
 * Analisa uma mensagem para detectar sentimento ou urgência
 */
export async function analyzeSentiment(
  message: string
): Promise<{ sentiment: "positive" | "neutral" | "negative"; urgency: "low" | "medium" | "high" }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um analisador de sentimento. Analise a mensagem e retorne um JSON com 'sentiment' (positive/neutral/negative) e 'urgency' (low/medium/high).",
        },
        {
          role: "user",
          content: `Analise esta mensagem:\n"${message}"\n\nRetorne apenas um JSON válido, sem explicações.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentiment_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative"],
              },
              urgency: {
                type: "string",
                enum: ["low", "medium", "high"],
              },
            },
            required: ["sentiment", "urgency"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (content && typeof content === "string") {
      const parsed = JSON.parse(content);
      return {
        sentiment: parsed.sentiment || "neutral",
        urgency: parsed.urgency || "low",
      };
    }

    return { sentiment: "neutral", urgency: "low" };
  } catch (error) {
    console.error("[LLM] Erro ao analisar sentimento:", error);
    return { sentiment: "neutral", urgency: "low" };
  }
}

/**
 * Extrai palavras-chave de uma mensagem
 */
export async function extractKeywords(message: string): Promise<string[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você extrai palavras-chave de mensagens. Retorne um JSON com um array de strings contendo as palavras-chave mais relevantes (máximo 5).",
        },
        {
          role: "user",
          content: `Extraia palavras-chave desta mensagem:\n"${message}"\n\nRetorne apenas um JSON válido: {"keywords": ["palavra1", "palavra2"]}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "keyword_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              keywords: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["keywords"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (content && typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.keywords || [];
    }

    return [];
  } catch (error) {
    console.error("[LLM] Erro ao extrair palavras-chave:", error);
    return [];
  }
}

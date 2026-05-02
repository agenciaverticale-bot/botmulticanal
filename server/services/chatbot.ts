import { getChatbotRules } from "../db";

/**
 * Verifica se uma mensagem dispara alguma regra de chatbot
 */
export async function checkChatbotRules(
  userId: number,
  message: string,
  platform: "whatsapp" | "instagram"
): Promise<{ ruleId: number; response: string } | null> {
  try {
    const rules = await getChatbotRules(userId);
    const filteredRules = rules.filter(
      (r: any) => r.platform === "both" || r.platform === platform
    );

    for (const rule of filteredRules) {
      const keywords = rule.triggerKeywords.split(",").map((k: string) => k.trim().toLowerCase());

      const messageWords = message.toLowerCase();

      // Verificar se alguma palavra-chave está presente na mensagem
      const triggered = keywords.some((keyword: string) => messageWords.includes(keyword));

      if (triggered) {
        return {
          ruleId: rule.id,
          response: rule.responseTemplate,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("[Chatbot] Erro ao verificar regras:", error);
    return null;
  }
}

/**
 * Processa variáveis de template na resposta automática
 * Suporta: {contactName}, {date}, {time}, {platform}
 */
export function processTemplate(
  template: string,
  variables: {
    contactName?: string;
    platform?: "whatsapp" | "instagram";
  }
): string {
  let processed = template;

  if (variables.contactName) {
    processed = processed.replace(/{contactName}/g, variables.contactName);
  }

  if (variables.platform) {
    processed = processed.replace(/{platform}/g, variables.platform === "whatsapp" ? "WhatsApp" : "Instagram");
  }

  // Data e hora
  const now = new Date();
  processed = processed.replace(/{date}/g, now.toLocaleDateString("pt-BR"));
  processed = processed.replace(/{time}/g, now.toLocaleTimeString("pt-BR"));

  return processed;
}

/**
 * Valida se uma resposta automática é apropriada
 * (evita respostas muito longas, spam, etc)
 */
export function validateResponse(response: string): boolean {
  // Verificar comprimento máximo (500 caracteres)
  if (response.length > 500) {
    return false;
  }

  // Verificar se não está vazio
  if (response.trim().length === 0) {
    return false;
  }

  // Verificar se não contém muitos caracteres especiais
  const specialChars = (response.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?/]/g) || []).length;
  if (specialChars > response.length * 0.3) {
    return false;
  }

  return true;
}

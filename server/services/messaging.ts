import { getApiCredential } from "../db";

const DEFAULT_EVOLUTION_API_URL = "https://api.evolution-api.com/v1";
const DEFAULT_INSTAGRAM_GRAPH_API_URL = "https://graph.facebook.com";

function normalizeUrl(value: string): string {
  return value.replace(/\/\/+$/, "");
}

function buildWhatsappPayload(
  phoneNumber: string,
  text: string,
  credential: { phoneNumberId?: string; businessAccountId?: string }
) {
  const baseUrl = normalizeUrl(process.env.EVOLUTION_API_URL ?? DEFAULT_EVOLUTION_API_URL);
  const isGraphApi = baseUrl.includes("graph.facebook.com");

  if (isGraphApi) {
    return {
      messaging_product: "whatsapp",
      to: phoneNumber,
      text: { body: text },
    };
  }

  return {
    phoneNumberId: credential.phoneNumberId,
    businessAccountId: credential.businessAccountId,
    to: phoneNumber,
    type: "text",
    text: { body: text },
  };
}

export async function sendWhatsAppMessage(
  userId: number,
  phoneNumber: string,
  text: string
): Promise<void> {
  const credential = await getApiCredential(userId, "whatsapp");

  if (!credential || !credential.token) {
    throw new Error("WhatsApp credentials are not configured for this user.");
  }

  if (!phoneNumber) {
    throw new Error("Missing destination phone number.");
  }

  const baseUrl = normalizeUrl(process.env.EVOLUTION_API_URL ?? DEFAULT_EVOLUTION_API_URL);
  const isGraphApi = baseUrl.includes("graph.facebook.com");

  const url = isGraphApi && credential.phoneNumberId
    ? `${baseUrl}/${credential.phoneNumberId}/messages`
    : `${baseUrl}/messages`;

  const payload = buildWhatsappPayload(phoneNumber, text, {
    phoneNumberId: credential.phoneNumberId,
    businessAccountId: credential.businessAccountId,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credential.token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

export async function sendInstagramMessage(
  userId: number,
  recipientId: string,
  text: string
): Promise<void> {
  const credential = await getApiCredential(userId, "instagram");

  if (!credential || !credential.token) {
    throw new Error("Instagram credentials are not configured for this user.");
  }

  const instagramId = credential.businessAccountId;
  if (!instagramId) {
    throw new Error("Instagram business account ID is not configured.");
  }

  if (!recipientId) {
    throw new Error("Missing Instagram recipient ID.");
  }

  const baseUrl = normalizeUrl(process.env.INSTAGRAM_GRAPH_API_URL ?? DEFAULT_INSTAGRAM_GRAPH_API_URL);
  const url = `${baseUrl}/${instagramId}/messages`;

  const payload = {
    recipient: { id: recipientId },
    message: { text },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credential.token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instagram send failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

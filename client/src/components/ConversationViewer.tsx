import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Lightbulb } from "lucide-react";
import type { Message } from "@/types/api";

interface ConversationViewerProps {
  conversationId: number;
}

export default function ConversationViewer({ conversationId }: ConversationViewerProps) {
  const [messageContent, setMessageContent] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const messages = trpc.messages.getMessages.useQuery({ conversationId });
  const sendMessage = trpc.messages.sendMessage.useMutation();
  const getSuggestion = trpc.messages.getSuggestion.useQuery(
    {
      conversationId,
      messageContent: messages.data?.[messages.data.length - 1]?.content || "",
    },
    { enabled: showSuggestion }
  );

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        contactId: 0, // TODO: Obter contactId da conversa
        content: messageContent,
        platform: "whatsapp", // TODO: Obter platform da conversa
      });

      setMessageContent("");
      messages.refetch();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  if (messages.isLoading) {
    return (
      <Card className="border-0 shadow-sm h-full flex items-center justify-center">
        <CardContent className="text-center py-16">
          <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Carregando conversa...</p>
        </CardContent>
      </Card>
    );
  }

  const messageList = messages.data || [];

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Conversa</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma mensagem nesta conversa</p>
          </div>
        ) : (
          messageList.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.direction === "outbound"
                    ? "bg-blue-100 text-blue-900 rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {msg.automatedResponse && (
                    <Badge className="text-xs bg-green-100 text-green-700">Auto</Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* LLM Suggestion */}
      {showSuggestion && getSuggestion.data?.suggestion && (
        <div className="border-t bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 mb-2">Sugestão de resposta:</p>
              <p className="text-sm text-blue-800">{getSuggestion.data.suggestion}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs"
                onClick={() => setMessageContent(getSuggestion.data?.suggestion || "")}
              >
                Usar sugestão
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4 space-y-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="resize-none h-20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageContent.trim() || sendMessage.isPending}
            size="sm"
            className="self-end"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestion(!showSuggestion)}
            className="text-xs"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            {showSuggestion ? "Ocultar" : "Sugestão"} IA
          </Button>
        </div>
      </div>
    </Card>
  );
}

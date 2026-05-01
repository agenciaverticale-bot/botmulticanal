import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import ConversationList from "@/components/ConversationList";
import ConversationViewer from "@/components/ConversationViewer";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const dashboardStats = trpc.messages.getDashboardStats.useQuery();
  const conversations = trpc.messages.getConversations.useQuery({ status: "open" });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo de volta, {user?.name || "usuário"}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                Conversas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardStats.data?.openConversations || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                de {dashboardStats.data?.totalConversations || 0} total
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-pink-400" />
                Não Respondidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardStats.data?.totalUnread || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                limite: {dashboardStats.data?.unreadThreshold || 10}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Respondidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {(dashboardStats.data?.totalConversations || 0) - (dashboardStats.data?.openConversations || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">hoje</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">2h 15m</p>
              <p className="text-xs text-gray-500 mt-1">resposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg">Conversas</CardTitle>
                <CardDescription>Clique para visualizar</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationList
                  conversations={conversations.data || []}
                  selectedId={selectedConversation}
                  onSelect={setSelectedConversation}
                />
              </CardContent>
            </Card>
          </div>

          {/* Conversation Viewer */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ConversationViewer conversationId={selectedConversation} />
            ) : (
              <Card className="border-0 shadow-sm h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Selecione uma conversa para começar</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

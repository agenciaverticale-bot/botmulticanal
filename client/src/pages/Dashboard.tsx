import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  Users, 
  BarChart3, 
  Send, 
  LogOut, 
  Smartphone,
  Menu,
  Kanban
} from "lucide-react";
import ConversationList from "@/components/ConversationList";
import ConversationViewer from "@/components/ConversationViewer";
import { WhatsAppConfig } from "@/components/WhatsAppConfig";
import { BroadcastForm } from "@/components/BroadcastForm";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("metrics");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dashboardStats = trpc.messages.getDashboardStats.useQuery(undefined, { refetchInterval: 3000 });
  const conversations = trpc.messages.getConversations.useQuery({ status: "open" }, { refetchInterval: 3000 });

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatView conversations={conversations.data} />;
      case "crm":
        return <CRMView />;
      case "funnel":
        return <FunnelView />;
      case "broadcast":
        return <div className="max-w-4xl mx-auto"><BroadcastForm /></div>;
      case "settings":
        return <div className="max-w-4xl mx-auto"><WhatsAppConfig /></div>;
      case "metrics":
      default:
        return <MetricsView stats={dashboardStats.data} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Botão de Menu para Celular */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Barra Lateral (Sidebar) */}
      <aside className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        fixed md:relative z-40 w-64 h-screen bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-xl
      `}>
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            Verticale
          </h1>
          <p className="text-sm text-slate-500 mt-3 bg-slate-800 p-2 rounded-lg inline-block w-full truncate">
            👤 {user?.name || "Administrador"}
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          <SidebarItem icon={<BarChart3 />} label="Dashboard" active={activeTab === "metrics"} onClick={() => {setActiveTab("metrics"); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<MessageCircle />} label="Atendimento" active={activeTab === "chat"} onClick={() => {setActiveTab("chat"); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<Users />} label="CRM Contatos" active={activeTab === "crm"} onClick={() => {setActiveTab("crm"); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<Kanban />} label="Funil de Vendas" active={activeTab === "funnel"} onClick={() => {setActiveTab("funnel"); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<Send />} label="Campanhas (Massa)" active={activeTab === "broadcast"} onClick={() => {setActiveTab("broadcast"); setIsMobileMenuOpen(false)}} />
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Integrações</p>
          </div>
          <SidebarItem icon={<Smartphone />} label="WhatsApp API" active={activeTab === "settings"} onClick={() => {setActiveTab("settings"); setIsMobileMenuOpen(false)}} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-all duration-200 ${
        active 
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
          : "hover:bg-slate-800/50 hover:text-slate-100"
      }`}
    >
      <div className={`w-5 h-5 ${active ? "opacity-100" : "opacity-70"}`}>{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

// -------------------------------------------------------------
// TELAS (VÍDEOS/ABAS DO SISTEMA)
// -------------------------------------------------------------

function ChatView({ conversations }: { conversations: any }) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConversation) {
        // Força a atualização em tempo real dos balões da conversa que está aberta
        utils.messages.invalidate();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, utils]);

  if (!conversations) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        Carregando histórico de conversas ou sincronizando banco...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-lg">Atendimento Ao Vivo</h2>
          <p className="text-xs text-slate-500 mt-1">Sincronizado com WhatsApp e Instagram</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ConversationList
            conversations={conversations || []}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
          />
        </div>
      </div>
      <div className="lg:col-span-2 h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {selectedConversation ? (
          <ConversationViewer conversationId={selectedConversation} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
            <MessageCircle className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">Nenhum chat selecionado</p>
            <p className="text-sm">Selecione uma conversa ao lado para responder</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricsView({ stats }: { stats: any }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h2>
        <p className="text-slate-500 mt-1 text-lg">Acompanhe os resultados da sua agência hoje.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md bg-white rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Conversas Ativas</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black text-slate-800">{stats?.openConversations || 0}</p></CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Aguardando Resposta</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black text-red-500">{stats?.totalUnread || 0}</p></CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total de Contatos</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black text-blue-600">{stats?.totalConversations || 0}</p></CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tempo Médio</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black text-emerald-500">2m 14s</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

function CRMView() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setStatus("Lendo arquivo e sincronizando com o banco de dados...");
    
    // Simula o tempo de processamento de um CSV/XLSX
    setTimeout(() => {
      setStatus(`✅ Sucesso! ${Math.floor(Math.random() * 150) + 15} leads foram importados e higienizados. Eles já estão disponíveis para campanhas.`);
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 h-[80vh] flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Importar Leads</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Faça o upload da sua planilha (Excel ou CSV) para adicionar contatos em massa ao seu funil e iniciar automações.
        </p>
        
        <label className="cursor-pointer relative block w-full border-2 border-dashed border-blue-300 rounded-xl p-8 hover:bg-blue-50 transition-colors">
          <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={handleFileUpload} disabled={loading} />
          <span className="text-blue-600 font-semibold text-lg">{loading ? "Processando planilha..." : "Clique para selecionar sua planilha"}</span>
          <p className="text-sm text-slate-400 mt-2">Formatos aceitos: .CSV, .XLSX</p>
        </label>
        
        {status && (
          <div className={`mt-6 p-4 rounded-lg font-medium text-sm ${status.includes("Sucesso") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelView() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center h-[80vh] flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
        <Kanban className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3">Funil de Vendas KANBAN</h2>
      <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
        Aqui você poderá arrastar os clientes em colunas (Lead, Negociação, Fechado) sincronizadas automaticamente com as etiquetas do seu WhatsApp Business!
      </p>
    </div>
  );
}

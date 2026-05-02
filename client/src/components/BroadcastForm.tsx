import { useState } from 'react';
import { AlertTriangle, Send, Users, ShieldAlert } from 'lucide-react';

export function BroadcastForm() {
  const [message, setMessage] = useState('');
  const [recipientCount, setRecipientCount] = useState(150); // Simulação
  const [showWarning, setShowWarning] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleAttemptSend = () => {
    if (!message) return;
    if (recipientCount > 50) {
      setShowWarning(true);
    } else {
      startBroadcast();
    }
  };

  const startBroadcast = () => {
    setShowWarning(false);
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      alert('Disparo iniciado em segundo plano com delay seguro!');
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Disparo em Massa</h2>
          <p className="text-sm text-gray-500">Envie mensagens para seus contatos ativos</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem da Campanha
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder="Olá {nome}! Temos uma novidade para você..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Dica: Use {'{nome}'} para personalizar a mensagem.</p>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5" />
            <span className="font-medium">Contatos Selecionados:</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{recipientCount}</span>
        </div>

        <button
          onClick={handleAttemptSend}
          disabled={!message || isSending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
          {isSending ? 'Enviando...' : 'Iniciar Disparo'}
        </button>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Risco de Banimento!</h3>
              <p className="text-gray-600 mb-6">Você está prestes a enviar <strong>{recipientCount} mensagens</strong> de uma só vez. O WhatsApp e o Instagram monitoram envios em massa e podem banir seu número.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left w-full text-sm text-yellow-800">
                <p className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Medidas de Segurança:</p>
                <ul className="list-disc pl-5 space-y-1"><li>Delay de 10 a 25 segundos entre as mensagens.</li><li>O envio total demorará cerca de {Math.ceil((recipientCount * 15) / 60)} minutos.</li></ul>
              </div>
              <div className="flex gap-3 w-full"><button onClick={() => setShowWarning(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancelar</button><button onClick={startBroadcast} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Enviar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
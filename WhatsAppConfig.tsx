import { useState } from 'react';
import { QrCode, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';

export function WhatsAppConfig() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      // Chama a rota que criamos no backend
      const response = await axios.get('/api/whatsapp/qrcode');
      setQrCode(response.data.qrCode);
    } catch (err) {
      setError('Não foi possível carregar o QR Code. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">WhatsApp Bot</h2>
          <p className="text-sm text-gray-500">Conecte seu aparelho escaneando o código</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
            <p>Gerando conexão segura...</p>
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center">
            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 rounded shadow-sm bg-white p-2" />
            <p className="mt-4 text-sm font-medium text-gray-600 text-center">Abra o WhatsApp no celular e escaneie o código acima.</p>
          </div>
        ) : (
          <button
            onClick={fetchQRCode}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Gerar QR Code
          </button>
        )}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
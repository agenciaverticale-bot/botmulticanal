import { useState } from "react";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const rawText = await response.text();
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error("O servidor falhou em responder. Pode ser um erro de conexão com o banco de dados.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao processar a solicitação.");
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <ShieldCheck className="w-16 h-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Acesse seu CRM
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border focus:ring-blue-500 focus:border-blue-500" placeholder="admin@empresa.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-100">{error}</div>}

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? "Processando..." : "Entrar"}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
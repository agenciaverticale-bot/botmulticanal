import { useState } from "react";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export function Login() {
  const [isSetup, setIsSetup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSetup ? "/api/auth/setup" : "/api/auth/login";
      const body = isSetup ? { name, email, password } : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao processar a solicitação.");
      }

      if (isSetup) {
        alert("Administrador criado com sucesso! Faça o login agora.");
        setIsSetup(false);
      } else {
        // Salva o token no localStorage e recarrega a página para entrar no painel
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      }
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
          {isSetup ? "Criar Administrador" : "Acesse seu CRM"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSetup && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border focus:ring-blue-500 focus:border-blue-500" placeholder="Seu nome" />
                </div>
              </div>
            )}

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
              {loading ? "Processando..." : isSetup ? "Criar Conta" : "Entrar"}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou</span></div>
            </div>
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setIsSetup(!isSetup)} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                {isSetup ? "Já tenho uma conta. Fazer Login" : "Primeiro acesso? Configurar Administrador"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import * as LucideIcons from "lucide-react";

interface LoginCardProps {
  isSetup: boolean;
}

export const LoginCard: React.FC<LoginCardProps> = ({ isSetup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (isSetup && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          isSetup,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to dashboard on success
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Une erreur est survenue lors de la connexion");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de contacter le serveur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-2xl glassmorphism text-left">
      <div className="mb-8 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4">
          {isSetup ? (
            <LucideIcons.ShieldAlert className="w-8 h-8" />
          ) : (
            <LucideIcons.Lock className="w-8 h-8" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isSetup ? "Configuration initiale" : "Espace Administration"}
        </h2>
        <p className="text-sm text-slate-400 mt-2 font-light">
          {isSetup
            ? "Créez votre compte administrateur pour configurer votre landing page."
            : "Connectez-vous pour configurer vos liens et voir les statistiques."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start space-x-3">
          <LucideIcons.AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Adresse email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <LucideIcons.Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              placeholder="admin@monadresse.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <LucideIcons.KeyRound className="w-5 h-5" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              placeholder="••••••••••••"
              required
            />
          </div>
        </div>

        {isSetup && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <LucideIcons.CheckCircle2 className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 flex justify-center items-center gap-2 border border-indigo-500/20 shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isSetup ? (
            "Créer le compte administrateur"
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </div>
  );
};

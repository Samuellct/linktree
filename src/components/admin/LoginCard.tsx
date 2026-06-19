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
    <div className="w-full max-w-md p-8 bg-slate-950 border border-slate-800 text-left rounded-none shadow-none font-serif">
      <div className="mb-8 text-center">
        <div className="inline-flex p-3 border border-slate-800 text-slate-400 mb-4 rounded-none">
          {isSetup ? (
            <LucideIcons.ShieldAlert className="w-6 h-6" />
          ) : (
            <LucideIcons.Lock className="w-6 h-6" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-serif-title">
          {isSetup ? "Configuration initiale" : "Espace Administration"}
        </h2>
        <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
          {isSetup
            ? "Créez votre compte administrateur pour configurer votre landing page."
            : "Connectez-vous pour configurer vos liens et voir les statistiques."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs flex items-start space-x-3 rounded-none">
          <LucideIcons.AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-sans">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Adresse email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <LucideIcons.Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 transition-colors text-sm rounded-none font-sans"
              placeholder="admin@monadresse.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Mot de passe</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <LucideIcons.KeyRound className="w-4 h-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 transition-colors text-sm rounded-none font-sans"
              placeholder="••••••••••••"
              required
            />
          </div>
        </div>

        {isSetup && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Confirmer le mot de passe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <LucideIcons.CheckCircle2 className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 transition-colors text-sm rounded-none font-sans"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-200 text-black font-bold text-sm transition-colors duration-200 focus:outline-none flex justify-center items-center gap-2 border border-white rounded-none cursor-pointer disabled:opacity-50 font-serif-title"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
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

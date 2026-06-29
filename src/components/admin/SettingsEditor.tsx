import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import type { Settings } from "../../lib/db";

interface SettingsEditorProps {
  initialSettings: Settings;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({ initialSettings }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "social" | "seo" | "analytics">("profile");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile fields
  const [siteName, setSiteName] = useState(settings.site_name || "");
  const [bio, setBio] = useState(settings.bio || "");
  const [avatar, setAvatar] = useState(settings.avatar || "");

  // Social fields
  const [socialGithub, setSocialGithub] = useState(settings.social_github || "");
  const [socialTwitter, setSocialTwitter] = useState(settings.social_twitter || "");
  const [socialLinkedin, setSocialLinkedin] = useState(settings.social_linkedin || "");
  const [socialInstagram, setSocialInstagram] = useState(settings.social_instagram || "");
  const [socialYoutube, setSocialYoutube] = useState(settings.social_youtube || "");

  // Appearance fields
  const [themeColor, setThemeColor] = useState(settings.theme_color || "#ffffff");
  const [fontFamily, setFontFamily] = useState(settings.font_family || "serif");
  const [animationsEnabled, setAnimationsEnabled] = useState(settings.animations_enabled !== "0");
  const [themeStyle, setThemeStyle] = useState(settings.theme_style || "light");

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(settings.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(settings.seo_description || "");
  const [ogImage, setOgImage] = useState(settings.og_image || "");
  const [favicon, setFavicon] = useState(settings.favicon || "");

  // Analytics fields
  const [umamiId, setUmamiId] = useState(settings.umami_id || "");
  const [umamiUrl, setUmamiUrl] = useState(settings.umami_url || "");

  // Canvas Image Compressor Helper
  const compressImage = (file: File, widthLimit: number, heightLimit: number, callback: (base64: string) => void) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Veuillez sélectionner un fichier image valide.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > widthLimit) {
            height *= widthLimit / width;
            width = widthLimit;
          }
        } else {
          if (height > heightLimit) {
            width *= heightLimit / height;
            height = heightLimit;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL("image/webp", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) compressImage(file, 180, 180, setAvatar);
  };

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) compressImage(file, 800, 418, setOgImage);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) compressImage(file, 64, 64, setFavicon);
  };

  // Submit Settings Update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload = {
      site_name: siteName,
      bio,
      avatar,
      social_github: socialGithub,
      social_twitter: socialTwitter,
      social_linkedin: socialLinkedin,
      social_instagram: socialInstagram,
      social_youtube: socialYoutube,
      theme_color: themeColor,
      font_family: fontFamily,
      animations_enabled: animationsEnabled ? "1" : "0",
      seo_title: seoTitle,
      seo_description: seoDescription,
      og_image: ogImage,
      favicon,
      umami_id: umamiId,
      umami_url: umamiUrl,
      theme_style: themeStyle,
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg("Configuration sauvegardée avec succès !");
        // Update local settings context
        setSettings(payload as any);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-serif-title border-b border-slate-800 pb-6 mb-2">Configuration du Site</h1>
        <p className="text-sm text-slate-400 mt-1">Personnalisez votre profil, l'apparence visuelle, le SEO et le tracking.</p>
      </div>

      {/* ALERTS */}
      {successMsg && (
        <div className="p-4 rounded-none bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 text-sm flex items-start space-x-3">
          <LucideIcons.CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-sans">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-none bg-red-950/20 border border-red-900/50 text-red-300 text-sm flex items-start space-x-3">
          <LucideIcons.AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-sans">{errorMsg}</span>
        </div>
      )}

      {/* Tabs & Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Tabs */}
        <div className="md:col-span-1 flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-semibold uppercase tracking-wider transition-all text-left cursor-pointer border-l-2 ${
              activeTab === "profile" ? "bg-slate-900 text-white border-white" : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <LucideIcons.User className="w-4 h-4" />
            Profil
          </button>
          
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-semibold uppercase tracking-wider transition-all text-left cursor-pointer border-l-2 ${
              activeTab === "appearance" ? "bg-slate-900 text-white border-white" : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <LucideIcons.Palette className="w-4 h-4" />
            Apparence
          </button>

          <button
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-semibold uppercase tracking-wider transition-all text-left cursor-pointer border-l-2 ${
              activeTab === "social" ? "bg-slate-900 text-white border-white" : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <LucideIcons.Share2 className="w-4 h-4" />
            Réseaux Sociaux
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-semibold uppercase tracking-wider transition-all text-left cursor-pointer border-l-2 ${
              activeTab === "seo" ? "bg-slate-900 text-white border-white" : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <LucideIcons.Globe className="w-4 h-4" />
            Référencement SEO
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-semibold uppercase tracking-wider transition-all text-left cursor-pointer border-l-2 ${
              activeTab === "analytics" ? "bg-slate-900 text-white border-white" : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <LucideIcons.LineChart className="w-4 h-4" />
            Statistiques
          </button>
        </div>

        {/* Form panel */}
        <div className="md:col-span-3 p-6 rounded-none bg-slate-950 border border-slate-800">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3 font-serif-title">Informations de Profil</h3>
                
                {/* Avatar upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Photo de profil</label>
                  <div className="flex items-center space-x-6">
                    {avatar ? (
                      <div className="relative w-20 h-20 rounded-none overflow-hidden border border-slate-800">
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAvatar("")}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity cursor-pointer"
                        >
                          <LucideIcons.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-20 h-20 rounded-none border border-dashed border-slate-800 hover:border-slate-650 flex flex-col items-center justify-center text-slate-600 hover:text-white cursor-pointer">
                        <LucideIcons.UserPlus className="w-5 h-5" />
                        <span className="text-[10px] mt-1 font-sans">Ajouter</span>
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    )}
                    <span className="text-xs text-slate-500 font-sans">Sélectionnez un fichier PNG ou JPG. La photo sera automatiquement redimensionnée.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Nom affiché</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Mon Pseudo"
                    className="w-full px-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Biographie courte</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Présentez-vous en quelques mots..."
                    className="w-full px-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm h-28 resize-none font-sans"
                  />
                </div>
              </div>
            )}

            {/* TAB: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3 font-serif-title">Apparence Visuelle</h3>
                
                {/* Visual Theme Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Déclinaison Galerie Éditoriale</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    {/* Light option */}
                    <button
                      type="button"
                      onClick={() => {
                        setThemeStyle("light");
                        setThemeColor("#ffffff");
                        setFontFamily("serif");
                      }}
                      className={`p-4 border text-left cursor-pointer transition-all rounded-none ${
                        themeStyle === "light"
                          ? "border-white bg-slate-900 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-sm font-serif-title">Mode Clair (Galerie Claire)</div>
                      <div className="text-[11px] text-slate-500 mt-1 font-sans">Fond blanc pur mat, contrastes d'encre noire. Minimaliste et élégant.</div>
                    </button>

                    {/* Dark option */}
                    <button
                      type="button"
                      onClick={() => {
                        setThemeStyle("dark");
                        setThemeColor("#0c0c0e");
                        setFontFamily("serif");
                      }}
                      className={`p-4 border text-left cursor-pointer transition-all rounded-none ${
                        themeStyle === "dark"
                          ? "border-white bg-slate-900 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-sm font-serif-title">Mode Sombre (Galerie Sombre)</div>
                      <div className="text-[11px] text-slate-500 mt-1 font-sans">Fond noir mat profond, contrastes de lin blanc cassé. Doux pour les yeux.</div>
                    </button>
                  </div>
                </div>

                {/* Micro-animations flag */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="animationCheck"
                    checked={animationsEnabled}
                    onChange={(e) => setAnimationsEnabled(e.target.checked)}
                    className="rounded-none bg-slate-950 border-slate-800 text-white focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  <label htmlFor="animationCheck" className="text-sm font-medium text-slate-300 font-sans">
                    Activer l'animation au survol (Inversion Brutaliste et Aperçu d'image)
                  </label>
                </div>
              </div>
            )}

            {/* TAB: SOCIAL */}
            {activeTab === "social" && (
              <div className="space-y-5">
                <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3 font-serif-title">Réseaux Sociaux principaux</h3>
                
                <div className="space-y-4">
                  {/* GitHub */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans">Pseudo GitHub</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-sans">github.com/</span>
                      <input
                        type="text"
                        value={socialGithub}
                        onChange={(e) => setSocialGithub(e.target.value)}
                        placeholder="pseudo"
                        className="w-full pl-24 pr-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Twitter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans">Pseudo Twitter / X</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-sans">twitter.com/</span>
                      <input
                        type="text"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        placeholder="pseudo"
                        className="w-full pl-24 pr-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans">Lien LinkedIn</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-sans">linkedin.com/in/</span>
                      <input
                        type="text"
                        value={socialLinkedin}
                        onChange={(e) => setSocialLinkedin(e.target.value)}
                        placeholder="profile"
                        className="w-full pl-32 pr-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans">Pseudo Instagram</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-sans">instagram.com/</span>
                      <input
                        type="text"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        placeholder="pseudo"
                        className="w-full pl-28 pr-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans">Chaîne YouTube</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-sans">youtube.com/</span>
                      <input
                        type="text"
                        value={socialYoutube}
                        onChange={(e) => setSocialYoutube(e.target.value)}
                        placeholder="c/chaine"
                        className="w-full pl-28 pr-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SEO */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3 font-serif-title">Référencement et Meta-données</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Titre de page (Meta Title)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="ex: Jean Dupont - Développeur Fullstack"
                    className="w-full px-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Description de page (Meta Description)</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Description affichée dans les résultats de recherche Google..."
                    className="w-full px-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm h-24 resize-none font-sans"
                  />
                </div>

                {/* Favicon & OG uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Favicon du site</label>
                    <div className="flex items-center space-x-4">
                      {favicon ? (
                        <div className="relative w-12 h-12 rounded-none overflow-hidden border border-slate-800 p-2 bg-slate-950">
                          <img src={favicon} alt="Favicon" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setFavicon("")}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity cursor-pointer"
                          >
                            <LucideIcons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-12 h-12 rounded-none border border-dashed border-slate-800 hover:border-slate-650 flex flex-col items-center justify-center text-slate-600 hover:text-white cursor-pointer">
                          <LucideIcons.Upload className="w-4 h-4" />
                          <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                        </label>
                      )}
                      <span className="text-[10px] text-slate-500 leading-tight font-sans">Format ICO ou PNG (max 64x64)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Image Open Graph (OG Share)</label>
                    <div className="flex items-center space-x-4">
                      {ogImage ? (
                        <div className="relative w-24 h-12 rounded-none overflow-hidden border border-slate-800">
                          <img src={ogImage} alt="OG" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setOgImage("")}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity cursor-pointer"
                          >
                            <LucideIcons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-24 h-12 rounded-none border border-dashed border-slate-800 hover:border-slate-650 flex flex-col items-center justify-center text-slate-600 hover:text-white cursor-pointer">
                          <LucideIcons.Upload className="w-4 h-4" />
                          <input type="file" accept="image/*" onChange={handleOgImageUpload} className="hidden" />
                        </label>
                      )}
                      <span className="text-[10px] text-slate-500 leading-tight font-sans">Image de partage réseaux sociaux (800x418)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3 font-serif-title">Intégration Umami Analytics</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Mesurez l'activité sur votre landing page sans violer la vie privée de vos visiteurs en connectant une instance Umami.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Adresse du script de suivi (Script URL)</label>
                  <input
                    type="url"
                    value={umamiUrl}
                    onChange={(e) => setUmamiUrl(e.target.value)}
                    placeholder="https://cloud.umami.is/script.js"
                    className="w-full px-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 font-sans leading-normal">
                    L'adresse de script fournie dans l'attribut <code>src</code> de votre code de suivi (ex : <code>https://cloud.umami.is/script.js</code>).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">ID du site (Website ID)</label>
                  <input
                    type="text"
                    value={umamiId}
                    onChange={(e) => setUmamiId(e.target.value)}
                    placeholder="xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-none bg-slate-950 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-slate-500 text-sm font-sans"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 font-sans leading-normal">
                    La clé de l'attribut <code>data-website-id</code> dans votre code de suivi (ex : <code>4e6253d7-ca41-4fee-9dc9-cb245caac372</code>).
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="border-t border-slate-800/60 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-none bg-white hover:bg-slate-200 border border-white text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Sauvegarder les modifications
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import type { Link } from "../../lib/db";

interface LinkEditorProps {
  initialLinks: Link[];
}

export const LinkEditor: React.FC<LinkEditorProps> = ({ initialLinks }) => {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [editingLink, setEditingLink] = useState<Partial<Link> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Link");
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common icons list
  const availableIcons = ["Link", "Github", "Twitter", "Linkedin", "Instagram", "Youtube", "Globe", "Briefcase", "Mail", "Phone", "BookOpen", "Code", "Music", "Video"];

  // Reset form states
  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setIcon("Link");
    setAccentColor("#4f46e5");
    setPreviewImage(null);
    setEnabled(true);
    setError(null);
  };

  // Compress and convert image file to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image (PNG, WebP ou JPG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to compress image
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed WebP data URL
        const dataUrl = canvas.toDataURL("image/webp", 0.7);
        setPreviewImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add a new link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !url) {
      setError("Le titre et l'URL sont requis");
      return;
    }

    if (!previewImage) {
      setError("Une image de prévisualisation est requise");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          preview_image: previewImage,
          description,
          icon,
          accent_color: accentColor,
          enabled: enabled ? 1 : 0,
        }),
      });

      if (res.ok) {
        // Refresh local links list
        const refreshRes = await fetch("/api/links");
        const refreshedLinks = await refreshRes.json();
        setLinks(refreshedLinks);
        resetForm();
        setShowAddForm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur de création du lien");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur de communication est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Delete a link
  const handleDeleteLink = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce lien ?")) return;

    try {
      const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter((l) => l.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle link status (Active/Inactive)
  const handleToggleLink = async (link: Link) => {
    const newStatus = link.enabled === 1 ? 0 : 1;
    try {
      // Optimistic update
      setLinks(
        links.map((l) => (l.id === link.id ? { ...l, enabled: newStatus } : l))
      );

      const res = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: link.id,
          enabled: newStatus,
        }),
      });

      if (!res.ok) {
        // Revert on error
        setLinks(links);
        alert("Erreur lors de la modification du statut");
      }
    } catch (e) {
      console.error(e);
      setLinks(links);
    }
  };

  // Open Edit Mode
  const startEdit = (link: Link) => {
    setEditingLink(link);
    setTitle(link.title);
    setUrl(link.url);
    setDescription(link.description || "");
    setIcon(link.icon || "Link");
    setAccentColor(link.accent_color || "#4f46e5");
    setPreviewImage(link.preview_image || null);
    setEnabled(link.enabled === 1);
    setShowAddForm(false);
  };

  // Save edited link
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.id) return;
    setError(null);

    if (!title || !url) {
      setError("Le titre et l'URL sont requis");
      return;
    }

    if (!previewImage) {
      setError("Une image de prévisualisation est requise");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLink.id,
          title,
          url,
          preview_image: previewImage,
          description,
          icon,
          accent_color: accentColor,
          enabled: enabled ? 1 : 0,
        }),
      });

      if (res.ok) {
        const refreshRes = await fetch("/api/links");
        const refreshedLinks = await refreshRes.json();
        setLinks(refreshedLinks);
        setEditingLink(null);
        resetForm();
      } else {
        const data = await res.json();
        setError(data.error || "Erreur de mise à jour");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // HTML5 Drag and Drop events
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...links];
    const draggedItem = list[draggedIndex];

    // Reorder array
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    // Optimistically update UI state
    setLinks(list);
    handleDragEnd();

    try {
      const idOrder = list.map((l) => l.id);
      const res = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reorder: true,
          idOrder,
        }),
      });

      if (!res.ok) {
        // Revert on error
        setLinks(links);
        alert("Erreur de sauvegarde de l'ordre");
      }
    } catch (e) {
      console.error(e);
      setLinks(links);
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des Liens</h1>
          <p className="text-sm text-slate-400 mt-1">Créez, modifiez et réorganisez vos liens publics.</p>
        </div>
        
        {!showAddForm && !editingLink && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all cursor-pointer shadow-md shadow-indigo-600/10 border border-indigo-500/20"
          >
            <LucideIcons.Plus className="w-4 h-4" />
            Nouveau lien
          </button>
        )}
      </div>

      {/* ERROR MSG */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start space-x-3">
          <LucideIcons.AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM: ADD OR EDIT LINK */}
      {(showAddForm || editingLink) && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-xl glassmorphism">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {editingLink ? <LucideIcons.Edit3 className="w-5 h-5 text-indigo-400" /> : <LucideIcons.Plus className="w-5 h-5 text-indigo-400" />}
              {editingLink ? "Modifier le lien" : "Ajouter un nouveau lien"}
            </h3>
            <button
              onClick={() => { setEditingLink(null); setShowAddForm(false); resetForm(); }}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <LucideIcons.X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={editingLink ? handleSaveEdit : handleAddLink} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column (Inputs) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Titre affiché (Obligatoire)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Mon GitHub"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">URL Cible (Obligatoire)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description courte (Facultatif)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Une brève explication..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm h-20 resize-none"
                />
              </div>
            </div>

            {/* Right Column (Visual styling) */}
            <div className="space-y-4">
              
              {/* Image Preview Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Image de prévisualisation (Obligatoire)
                </label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-slate-800">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity cursor-pointer"
                      >
                        <LucideIcons.Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-28 h-16 rounded-lg border border-dashed border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 cursor-pointer">
                      <LucideIcons.Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px]">Téléverser</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  <div className="text-xs text-slate-500">
                    <p>Formats recommandés : WebP, PNG, JPG.</p>
                    <p className="mt-1">L'image sera redimensionnée pour la prévisualisation au survol.</p>
                  </div>
                </div>
              </div>

              {/* Icon / Color picker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Icône</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  >
                    {availableIcons.map((ic) => (
                      <option key={ic} value={ic} className="bg-slate-950">
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Accentuation</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#4f46e5"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Status flag */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enabledCheck"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/50 w-4 h-4"
                />
                <label htmlFor="enabledCheck" className="text-sm font-medium text-slate-300">
                  Activer immédiatement ce lien
                </label>
              </div>

            </div>

            {/* Form actions */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 border-t border-slate-800/60 pt-4 mt-2">
              <button
                type="button"
                onClick={() => { setEditingLink(null); setShowAddForm(false); resetForm(); }}
                className="px-4 py-2 rounded-xl hover:bg-slate-800 text-slate-300 text-sm transition-colors cursor-pointer border border-transparent"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Sauvegarde..." : editingLink ? "Mettre à jour" : "Créer le lien"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* DRAGGABLE LINKS LIST */}
      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link, index) => {
            const isDragOver = dragOverIndex === index;
            const isDragged = draggedIndex === index;
            const itemStyle = link.enabled === 1 ? {} : { opacity: 0.5 };

            return (
              <div
                key={link.id}
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(index)}
                className={`p-4 rounded-2xl bg-slate-900/40 border transition-all duration-200 flex items-center justify-between ${
                  isDragOver ? "border-indigo-500 border-dashed translate-y-1" : "border-slate-800/80"
                } ${isDragged ? "opacity-30 border-dashed" : ""}`}
                style={itemStyle}
              >
                {/* Drag info & Title */}
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1">
                    <LucideIcons.GripVertical className="w-5 h-5" />
                  </div>
                  
                  {link.preview_image ? (
                    <div className="w-14 h-9 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                      <img src={link.preview_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700 flex-shrink-0">
                      <LucideIcons.Image className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-[300px]">
                        {link.title}
                      </span>
                      {link.accent_color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: link.accent_color }}
                          title={`Couleur accent: ${link.accent_color}`}
                        ></span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 truncate block max-w-[150px] sm:max-w-[300px]">
                      {link.url}
                    </span>
                  </div>
                </div>

                {/* Status Toggle & Actions */}
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                  {/* Status label / click toggler */}
                  <button
                    onClick={() => handleToggleLink(link)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                      link.enabled === 1
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-slate-800/40 text-slate-500 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {link.enabled === 1 ? "Actif" : "Désactivé"}
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(link)}
                    className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800/40"
                    title="Modifier"
                  >
                    <LucideIcons.Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 rounded-xl bg-slate-950/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-slate-800/40"
                    title="Supprimer"
                  >
                    <LucideIcons.Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500">
            <LucideIcons.Link2 className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="font-medium text-slate-400">Aucun lien n'a été créé</p>
            <p className="text-xs text-slate-600 mt-1">Cliquez sur "Nouveau lien" en haut pour commencer.</p>
          </div>
        )}
      </div>

    </div>
  );
};

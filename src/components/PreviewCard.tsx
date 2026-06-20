import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface PreviewCardProps {
  title: string;
  url: string;
  previewImage?: string | null;
  description?: string | null;
  accentColor?: string | null;
  iconName?: string | null;
  clickUrl: string;
  animationsEnabled?: boolean;
}

// Dynamically resolve Lucide icons
const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    return <LucideIcons.Link className={className} />;
  }
  return <IconComponent className={className} />;
};

export const PreviewCard: React.FC<PreviewCardProps> = ({
  title,
  url,
  previewImage,
  description,
  accentColor,
  iconName,
  clickUrl,
  animationsEnabled = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Parse hostname for display
  const displayUrl = React.useMemo(() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }, [url]);

  // Use accentColor only if specified, otherwise fall back to theme colors
  const cardStyle = accentColor ? { borderColor: accentColor } : {};
  const textAccent = accentColor ? { color: accentColor } : {};

  // Framer Motion variants for the popup
  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 24,
      },
    },
    exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.12 } },
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Link Button */}
      <a
        href={clickUrl}
        className="flex items-center justify-between w-full p-4 mb-4 border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-[var(--color-hover-bg)] hover:text-[var(--color-hover-text)] transition-all duration-200 rounded-none group"
        style={cardStyle}
        data-umami-event="click-link"
        data-umami-event-title={title}
        data-umami-event-url={url}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 border border-current text-current/80 group-hover:scale-105 transition-transform duration-200">
            <IconRenderer name={iconName || "Link"} className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm tracking-tight group-hover:text-[var(--color-hover-text)] transition-colors" style={textAccent}>
              {title}
            </h3>
            {description && (
              <p className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-hover-muted)] transition-colors line-clamp-1 mt-0.5 font-light">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="p-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-hover-text)] group-hover:translate-x-0.5 transition-all">
          <span className="text-sm font-mono font-bold">→</span>
        </div>
      </a>

      {/* Floating Animated Website Preview */}
      {previewImage && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              variants={animationsEnabled ? tooltipVariants : {}}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-1/2 -translate-x-1/2 -top-[235px] z-50 w-72 p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-xl pointer-events-none origin-bottom rounded-none text-[var(--color-text)]"
            >
              {/* Site Preview Image */}
              <div className="relative w-full h-32 overflow-hidden bg-slate-900 border border-[var(--color-border)]">
                <img
                  src={previewImage}
                  alt={`Aperçu de ${title}`}
                  className="w-full h-full object-cover grayscale"
                  loading="lazy"
                />
              </div>

              {/* Site Details */}
              <div className="mt-3 text-left">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium truncate" style={textAccent}>
                  {displayUrl}
                </p>
                <h4 className="text-sm font-bold truncate mt-0.5 font-serif-title">{title}</h4>
                {description && (
                  <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 mt-1 leading-relaxed font-light">
                    {description}
                  </p>
                )}
              </div>

              {/* Arrow pointer */}
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-[var(--color-card-bg)] border-r border-b border-[var(--color-border)]"></div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

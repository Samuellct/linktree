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

  const cardStyle = accentColor ? { borderColor: accentColor } : {};
  const textAccent = accentColor ? { color: accentColor } : {};
  const bgAccent = accentColor ? { backgroundColor: `${accentColor}15` } : {};

  // Framer Motion variants
  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: { opacity: 0, scale: 0.95, y: 5, transition: { duration: 0.15 } },
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
        className="flex items-center justify-between w-full p-4 mb-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group"
        style={cardStyle}
      >
        <div className="flex items-center space-x-4">
          <div
            className="p-2.5 rounded-xl bg-slate-800/80 text-indigo-400 group-hover:scale-110 transition-transform duration-300"
            style={bgAccent}
          >
            <IconRenderer name={iconName || "Link"} className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors" style={textAccent}>
              {title}
            </h3>
            {description && <p className="text-sm text-slate-400 line-clamp-1">{description}</p>}
          </div>
        </div>

        <div className="p-1 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
          <LucideIcons.ArrowRight className="w-5 h-5" />
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
              className="absolute left-1/2 -translate-x-1/2 -top-[235px] z-50 w-72 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl glassmorphism pointer-events-none origin-bottom"
            >
              {/* Site Preview Image */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={previewImage}
                  alt={`Aperçu de ${title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Site Details */}
              <div className="mt-3 text-left">
                <p className="text-xs text-indigo-400 font-medium truncate" style={textAccent}>
                  {displayUrl}
                </p>
                <h4 className="text-sm font-semibold text-white truncate mt-0.5">{title}</h4>
                {description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Arrow pointer */}
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-950 border-r border-b border-slate-800/80"></div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

import { useEffect, useRef, useState, CSSProperties } from "react";
import { Sparkles, Cpu, Layers } from "lucide-react";

export default function FixedCards() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [opacity, setOpacity] = useState(0);
  const [maskStyle, setMaskStyle] = useState<CSSProperties>({});

  useEffect(() => {
    let animationFrameId: number;

    const tickCards = () => {
      const trigger = document.getElementById("cards-trigger");
      if (!trigger) {
        animationFrameId = requestAnimationFrame(tickCards);
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const triggerTop = rect.top + window.scrollY;
      const triggerHeight = rect.height;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Scroll thresholds
      const start = triggerTop - vh * 0.5;
      const end = triggerTop + triggerHeight - vh * 0.3;
      const range = end - start;

      let progress = range > 0 ? (scrollY - start) / range : 0;
      progress = Math.max(0, Math.min(1, progress));

      // Container opacity: Fades in over vh*0.2, stays active, then fades out over vh*0.3
      const isActive = scrollY >= start - vh * 0.2 && scrollY <= end + vh * 0.3;
      const fadeIn = Math.min(1, Math.max(0, (scrollY - (start - vh * 0.2)) / (vh * 0.2)));
      const fadeOut = Math.min(1, Math.max(0, (end + vh * 0.3 - scrollY) / (vh * 0.3)));
      const calculatedOpacity = isActive ? Math.min(fadeIn, fadeOut) : 0;

      setOpacity(calculatedOpacity);

      // Mask gradient sliding
      const isMobile = window.innerWidth < 768;
      const revealPct = progress * 130;
      const maskGradient = isMobile
        ? `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`
        : `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;

      setMaskStyle({
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
      });

      animationFrameId = requestAnimationFrame(tickCards);
    };

    animationFrameId = requestAnimationFrame(tickCards);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const cardsData = [
    {
      title: "Explore Veldara",
      desc: "Veldara merges the elegance of Svelte 5 with the depth of Three.js within easy reach. It's crafted to be robust and adaptable while remaining intuitive and simple to grasp.",
      icon: Sparkles,
      color: "from-blue-600/5 to-transparent",
      iconColor: "text-blue-500",
    },
    {
      title: "Unlock Three.js",
      desc: "The web is growing increasingly dimensional. At its heart, Veldara offers a composable declarative API for building performant Three.js experiences on the web.",
      icon: Cpu,
      color: "from-blue-600/5 to-transparent",
      iconColor: "text-blue-500",
    },
    {
      title: "Connect Everything",
      desc: "Veldara ships with tooling for physics, XR, animation, layouting, model loading, and extensive utilities to make building compelling 3D apps for the web effortless.",
      icon: Layers,
      color: "from-blue-600/5 to-transparent",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div
      ref={containerRef}
      id="fixed-cards"
      className="fixed bottom-0 inset-x-0 z-30 px-6 md:px-12 pb-12 transition-all duration-300 pointer-events-none"
      style={{
        opacity: opacity,
        transform: `translateY(${(1 - opacity) * 20}px)`,
        pointerEvents: opacity > 0.15 ? "auto" : "none",
      }}
    >
      <div
        ref={gridRef}
        className="grid max-w-6xl mx-auto grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 bg-black/60 backdrop-blur-xl p-8 rounded-sm border border-white/5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9)]"
        style={maskStyle}
      >
        {cardsData.map((card, i) => {
          const IconComponent = card.icon;
          return (
            <div
              key={i}
              className={`group flex flex-col rounded-sm border border-white/5 p-6 bg-gradient-to-br ${card.color} hover:border-blue-500/20 transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-sm bg-zinc-950 border border-white/5 group-hover:border-blue-500/20 group-hover:bg-zinc-900/40 transition-colors duration-300 ${card.iconColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-light italic font-serif text-white group-hover:text-zinc-100 tracking-tight transition-colors">
                  {card.title}
                </h3>
              </div>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

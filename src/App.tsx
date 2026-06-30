import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import ParticleBackground from "./components/ParticleBackground";
import ScrollVideoBackground from "./components/ScrollVideoBackground";
import FixedCards from "./components/FixedCards";
import { ChevronDown, Copy, Check, Terminal, ArrowRight } from "lucide-react";

export default function App() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const sectionThreeInnerRef = useRef<HTMLDivElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [sectionThreeVisible, setSectionThreeVisible] = useState(false);

  // Scroll opacity logic for Hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.3));
        heroRef.current.style.opacity = String(fade);
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
        heroRef.current.style.pointerEvents = fade < 0.05 ? "none" : "auto";
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Intersection observer for Section 3 slide-up
  useEffect(() => {
    const target = sectionThreeInnerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionThreeVisible(true);
          observer.unobserve(target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(target);
    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, []);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npm i @veldara/core");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f4f4f5] overflow-x-hidden font-sans select-none selection:bg-blue-500/20 selection:text-white">
      {/* 1. Interactive Scroll Video Canvas */}
      <ScrollVideoBackground />

      {/* 2. Floating Starfield Particles Canvas */}
      <ParticleBackground />

      {/* 3. Sticky Blurry Navigation Bar */}
      <Navbar />

      {/* 4. Interactive Mask-Revealed Floating Scroll Cards */}
      <FixedCards />

      {/* 5. Main Content Scroller */}
      <div id="content" className="relative z-20 w-full">
        
        {/* Section 1: Hero landing view */}
        <section
          id="hero"
          ref={heroRef}
          className="relative h-screen w-full flex flex-col justify-between items-center transition-opacity duration-150 ease-out"
        >
          {/* Subtle bottom gradient cover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Radial glow background effect for the Sophisticated Dark style */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-5xl aspect-square bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.12)_0%,_transparent_65%)] blur-[130px] pointer-events-none z-0" />

          {/* Centered Hero Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-end text-center px-6 pb-20 md:pb-28">
            <div className="animate-fade-in duration-1000 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-blue-500 font-bold mb-6 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                The Future of WebGL
              </span>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-light leading-[1.1] text-white tracking-tight font-serif italic max-w-4xl mx-auto">
                Sculpt <span className="text-zinc-500">reality</span> <br />
                in the browser.
              </h1>
            </div>

            {/* CTAs and interactive terminal command in Sophisticated style */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-12 max-w-lg w-full px-4">
              {/* Command copier */}
              <button
                onClick={handleCopyCommand}
                className="group flex-1 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-sm text-left relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 cursor-pointer"
                title="Click to copy command"
              >
                <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1 font-mono flex items-center justify-between">
                  <span>Terminal</span>
                  {copied ? (
                    <span className="text-emerald-400 font-sans flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to copy</span>
                  )}
                </div>
                <code className="text-xs sm:text-sm text-blue-400 font-mono block truncate">
                  npm i @veldara/core
                </code>
              </button>

              {/* Action Button */}
              <a
                href="#"
                className="px-8 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 py-4 sm:py-0 sm:self-stretch"
              >
                Deploy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Bouncing Chevron scroll hint */}
          <div className="relative z-10 pb-8 flex flex-col items-center gap-1.5 animate-bounce">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Scroll down
            </span>
            <ChevronDown className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
          </div>
        </section>

        {/* Spacer for natural scroll mapping (corresponds to original spacer + cards-trigger + second spacer) */}
        <div style={{ height: "150vh" }} />

        {/* Cards Trigger Zone: Activates the card opacity and mask sweeps */}
        <div id="cards-trigger" style={{ height: "200vh" }} className="pointer-events-none" />

        <div style={{ height: "100vh" }} />

        {/* Section 3: Breathtaking presentation highlight footer */}
        <section
          id="section-three"
          className="relative min-h-[90vh] flex items-end justify-center px-6 pb-24 md:pb-36 bg-gradient-to-t from-black via-transparent to-transparent"
        >
          {/* Visual abstract glows behind Section 3 footer */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-4xl aspect-square bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.08)_0%,_transparent_70%)] blur-[110px] pointer-events-none z-0" />

          <div
            ref={sectionThreeInnerRef}
            id="section-three-inner"
            className={`relative z-10 flex flex-col items-center text-center transition-all duration-1000 ease-out transform ${
              sectionThreeVisible
                ? "opacity-100 translate-y-0 blur-none"
                : "opacity-0 translate-y-8 blur-sm"
            }`}
          >
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              Presenting
            </span>
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-light italic font-serif text-white tracking-tighter select-none pb-2">
              Veldara <span className="text-zinc-500 font-normal">8</span>
            </h2>
            <div className="h-[1px] w-12 bg-blue-500 mt-6" />
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-4">
              Coming Fall 2026
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

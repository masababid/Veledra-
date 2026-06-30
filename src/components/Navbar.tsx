import { useState, useEffect } from "react";
import { Github, Twitter, MessageSquare, Menu, X, ExternalLink } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300 border-b border-white/5 ${
        isScrolled
          ? "bg-[#050505]/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* Left side: Brand Logo and main nav links */}
      <div className="flex items-center gap-10">
        <a href="#" className="flex items-center gap-1.5 group">
          <span className="font-bold text-xl tracking-tighter text-white uppercase group-hover:text-blue-400 transition-colors duration-200">
            veldara
          </span>
          <span className="h-1 w-1 rounded-full bg-blue-600 group-hover:bg-blue-400 transition-colors duration-200" />
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-[10px] md:text-xs font-medium uppercase tracking-widest text-zinc-400">
          <a
            href="#"
            className="hover:text-white transition-colors duration-150"
          >
            Guides
          </a>
          <a
            href="#"
            className="hover:text-white transition-colors duration-150"
          >
            Journal
          </a>
        </div>
      </div>

      {/* Right side: Social links, version, and action button */}
      <div className="flex items-center gap-6">
        <span className="hidden sm:inline text-xs font-mono text-zinc-500">
          v8.0.2-beta
        </span>

        {/* Desktop Install Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText("npm i @veldara/core");
            alert("Command 'npm i @veldara/core' copied to clipboard!");
          }}
          className="hidden md:block px-5 py-2 bg-white text-black text-xs font-bold uppercase tracking-tighter hover:bg-zinc-200 transition-all duration-150 rounded-sm cursor-pointer"
        >
          Install CLI
        </button>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-900/80 rounded-sm transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-[#050505]/95 backdrop-blur-xl z-40 flex flex-col p-8 md:hidden animate-in fade-in duration-200 border-t border-white/5">
          <div className="flex flex-col gap-6">
            <a
              href="#"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-white border-b border-white/5 pb-3"
            >
              Guides
            </a>
            <a
              href="#"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-white border-b border-white/5 pb-3"
            >
              Journal
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText("npm i @veldara/core");
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-center py-3 bg-white text-black text-xs font-bold uppercase tracking-tighter hover:bg-zinc-200 rounded-sm transition-colors mt-2"
            >
              Install CLI
            </button>
          </div>

          <div className="mt-auto flex items-center gap-6 justify-center border-t border-white/5 pt-6 text-zinc-500 font-mono text-xs">
            <span>v8.0.2-beta</span>
          </div>
        </div>
      )}
    </nav>
  );
}

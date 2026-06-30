import { useEffect, useRef, useState } from "react";

interface ScrollVideoBackgroundProps {
  onLoadProgress?: (progress: number) => void;
  onLoaded?: (loaded: boolean) => void;
}

export default function ScrollVideoBackground({
  onLoadProgress,
  onLoaded,
}: ScrollVideoBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoFallbackRef = useRef<HTMLVideoElement | null>(null);

  const [frames, setFrames] = useState<ImageBitmap[]>([]);
  const [framesReady, setFramesReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing Veldara 3D Engine...");
  
  const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4";

  // Cache refs to avoid stale values in fast scroll ticks
  const framesRef = useRef<ImageBitmap[]>([]);
  const framesReadyRef = useRef(false);
  const lastFrameIndexRef = useRef(-1);
  const videoSeekingRef = useRef(false);

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  useEffect(() => {
    framesReadyRef.current = framesReady;
  }, [framesReady]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      lastFrameIndexRef.current = -1; // Force redraw on next tick
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Frame Extraction Process
  useEffect(() => {
    let active = true;

    async function extractFrames() {
      try {
        setLoadingText("Fetching video asset...");
        const response = await fetch(videoUrl, { mode: "cors" });
        if (!response.ok) throw new Error("CORS or network error");
        
        const blob = await response.blob();
        if (!active) return;

        const objectUrl = URL.createObjectURL(blob);
        const tempVideo = document.createElement("video");
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        tempVideo.crossOrigin = "anonymous";
        tempVideo.preload = "auto";
        tempVideo.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          tempVideo.onloadedmetadata = () => resolve();
          tempVideo.onerror = () => reject(new Error("Video load failed"));
          // Safety timeout after 15s
          setTimeout(() => reject(new Error("Timeout loading metadata")), 15000);
        });

        if (!active) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        const scale = Math.min(1, 1280 / tempVideo.videoWidth);
        const scaledWidth = Math.round(tempVideo.videoWidth * scale);
        const scaledHeight = Math.round(tempVideo.videoHeight * scale);
        
        // 24fps extraction - clamp to a performant length
        const frameCount = Math.max(30, Math.min(120, Math.round(tempVideo.duration * 24)));
        const extracted: ImageBitmap[] = [];

        setLoadingText("Extracting spatial frames...");

        for (let i = 0; i < frameCount; i++) {
          if (!active) {
            URL.revokeObjectURL(objectUrl);
            return;
          }
          const time = (i / (frameCount - 1)) * (tempVideo.duration - 0.05);
          tempVideo.currentTime = time;

          await new Promise<void>((resolve, reject) => {
            const onSeeked = () => {
              tempVideo.removeEventListener("seeked", onSeeked);
              resolve();
            };
            tempVideo.addEventListener("seeked", onSeeked);
            setTimeout(() => {
              tempVideo.removeEventListener("seeked", onSeeked);
              reject(new Error("Seek timeout"));
            }, 3000);
          });

          const bitmap = await createImageBitmap(tempVideo, {
            resizeWidth: scaledWidth,
            resizeHeight: scaledHeight,
          });
          extracted.push(bitmap);
          
          const progress = Math.round(((i + 1) / frameCount) * 100);
          setLoadingProgress(progress);
          onLoadProgress?.(progress);
        }

        if (extracted.length > 0 && active) {
          setFrames(extracted);
          setFramesReady(true);
          onLoaded?.(true);
          setLoadingText("Spatial engine online");
        }
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.warn("High-perf frame cache failed, falling back to direct video scrubbing:", err);
        setLoadingText("Fallback engine active (Direct Seek)");
        setLoadingProgress(100);
        onLoaded?.(false);
      }
    }

    extractFrames();

    return () => {
      active = false;
    };
  }, [onLoadProgress, onLoaded]);

  // Main tick loop for rendering the current frame or fallback video scrubbing
  useEffect(() => {
    let animationFrameId: number;

    const getScrollBounds = () => {
      const vh = window.innerHeight;
      return {
        start: vh * 0.5,
        end: document.documentElement.scrollHeight - vh,
      };
    };

    const getProgress = () => {
      const { start, end } = getScrollBounds();
      const range = end - start;
      if (range <= 0) return 0;
      return Math.max(0, Math.min(1, (window.scrollY - start) / range));
    };

    const drawFrame = (frame: ImageBitmap) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / frame.width, ch / frame.height);
      const dw = frame.width * s;
      const dh = frame.height * s;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const tick = () => {
      const progress = getProgress();

      if (framesReadyRef.current && framesRef.current.length > 0) {
        const idx = Math.round(progress * (framesRef.current.length - 1));
        if (idx !== lastFrameIndexRef.current) {
          lastFrameIndexRef.current = idx;
          const currentFrame = framesRef.current[idx];
          if (currentFrame) {
            drawFrame(currentFrame);
          }
        }
      } else {
        // Fallback: Scrub HTML5 Video element directly
        const video = videoFallbackRef.current;
        if (video && video.duration && isFinite(video.duration) && video.readyState >= 1) {
          const target = progress * video.duration;
          if (!videoSeekingRef.current && Math.abs(video.currentTime - target) > 0.01) {
            videoSeekingRef.current = true;
            video.currentTime = target;
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSeeked = () => {
    videoSeekingRef.current = false;
  };

  return (
    <div
      id="scroll-video-container"
      className="fixed inset-x-0 -top-[10%] -bottom-[10%] h-[120vh] w-full z-0 bg-[#020202]"
    >
      {/* Canvas for High-Performance ImageBitmap frames */}
      <canvas
        ref={canvasRef}
        id="video-canvas"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        style={{
          opacity: framesReady ? 1 : 0,
          visibility: framesReady ? "visible" : "hidden",
        }}
      />

      {/* HTML5 Video element as immediate fallback */}
      <video
        ref={videoFallbackRef}
        id="video-fallback"
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        onSeeked={handleSeeked}
        onStalled={handleSeeked}
        style={{
          opacity: framesReady ? 0 : 0.45,
          display: framesReady ? "none" : "block",
        }}
      />

      {/* Elegant dark radial shadow overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,0,0,0.1)_0%,rgba(1,1,1,0.75)_85%,#010101_100%] pointer-events-none" />

      {/* Top and Bottom soft shadows for depth */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#010101] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#010101] to-transparent pointer-events-none" />

      {/* Technical Frame Extract Loading Bar (Fades out when complete) */}
      {!framesReady && loadingProgress < 100 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 bg-[#080808]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#1a1a1a] z-50">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              {loadingText}
            </span>
          </div>
          <div className="w-48 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2c5c88] to-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-zinc-500">{loadingProgress}% cached</span>
        </div>
      )}
    </div>
  );
}

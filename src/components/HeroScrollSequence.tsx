import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Clock, Sparkles, Store } from 'lucide-react';
import { HERO_FRAME_URLS } from '../data/heroFrames';

interface HeroScrollSequenceProps {
  estimatedTime: string;
  onOpenBuilder: () => void;
  onViewMenu: () => void;
}

const ACTIVE_FRAME_URLS = HERO_FRAME_URLS;
const TOTAL_FRAMES = ACTIVE_FRAME_URLS.length;

function getUrlHashKey(url: string): string {
  const match = url.match(/_([a-f0-9]+)\.webp$/i);
  return match ? match[1] : url;
}

export const HeroScrollSequence: React.FC<HeroScrollSequenceProps> = ({
  estimatedTime,
  onOpenBuilder,
  onViewMenu,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrimLayerRef = useRef<HTMLDivElement | null>(null);
  const exitDimRef = useRef<HTMLDivElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const interactiveGroupRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const frameImagesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  const loadedMaskRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const lastDrawnIdxRef = useRef<number>(-1);
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const targetRatioRef = useRef<number>(0);
  const currentRatioRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stageMetricsRef = useRef<{ width: number; height: number; stickyTop: number }>({
    width: 0,
    height: 0,
    stickyTop: 64,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const applyContrastFade = (ratio: number) => {
    const textFade = Math.min(1, Math.max(0, ratio / 0.24));
    const scrimFade = Math.min(1, Math.max(0, ratio / 0.34));
    const cueFade = Math.min(1, Math.max(0, ratio / 0.1));

    if (scrimLayerRef.current) {
      scrimLayerRef.current.style.opacity = String(1 - scrimFade);
    }

    if (textLayerRef.current) {
      const opacity = 1 - textFade;
      textLayerRef.current.style.opacity = String(opacity);
      textLayerRef.current.style.transform = `translate3d(0, ${-textFade * 24}px, 0)`;
    }

    if (interactiveGroupRef.current) {
      interactiveGroupRef.current.style.pointerEvents =
        textFade > 0.85 ? 'none' : 'auto';
    }

    if (scrollCueRef.current) {
      scrollCueRef.current.style.opacity = String(1 - cueFade);
    }

    // Subtle depth recession as the second section glides up over the final 20% of the animation
    const exitProgress = Math.min(1, Math.max(0, (ratio - 0.8) / 0.2));
    if (canvasRef.current) {
      const scale = reducedMotion ? 1 : 1 - exitProgress * 0.045;
      canvasRef.current.style.transform = `scale(${scale})`;
    }
    if (exitDimRef.current) {
      exitDimRef.current.style.opacity = String(exitProgress * 0.35);
    }
  };

  const drawFrameToCanvas = (requestedIdx: number, force = false) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(requestedIdx)));
    const imgs = frameImagesRef.current;
    const loaded = loadedMaskRef.current;

    let drawIdx = clamped;
    if (!loaded[drawIdx]) {
      let found = -1;
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (clamped - offset >= 0 && loaded[clamped - offset]) {
          found = clamped - offset;
          break;
        }
        if (clamped + offset < TOTAL_FRAMES && loaded[clamped + offset]) {
          found = clamped + offset;
          break;
        }
      }
      if (found === -1) return;
      drawIdx = found;
    }

    if (!force && drawIdx === lastDrawnIdxRef.current) return;

    const img = imgs[drawIdx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    let { width, height } = stageMetricsRef.current;
    if (width <= 0 || height <= 0) {
      const rect = stage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      stageMetricsRef.current.width = width;
      stageMetricsRef.current.height = height;
    }
    if (width <= 0 || height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Preserve aspect ratio with centered cover fill across desktop and mobile
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = width / height;

    let drawW: number;
    let drawH: number;
    if (boxRatio > imgRatio) {
      drawW = width;
      drawH = width / imgRatio;
    } else {
      drawH = height;
      drawW = height * imgRatio;
    }

    const offsetX = (width - drawW) * 0.5;
    const offsetY = (height - drawH) * 0.5;

    ctx.fillStyle = '#2E0A3A';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

    lastDrawnIdxRef.current = drawIdx;
  };

  // Deduplicated, keyframe-first preloader for all 300 WEBP frames
  useEffect(() => {
    let cancelled = false;

    const hashToIndices = new Map<string, number[]>();
    const uniqueTasks: { url: string; indices: number[] }[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const url = ACTIVE_FRAME_URLS[i];
      const key = getUrlHashKey(url);
      const existing = hashToIndices.get(key);
      if (existing) {
        existing.push(i);
      } else {
        const list = [i];
        hashToIndices.set(key, list);
        uniqueTasks.push({ url, indices: list });
      }
    }

    const priorityTaskSet = new Set<number>();
    const orderedTasks: { url: string; indices: number[] }[] = [];

    const addTaskContaining = (frameIdx: number) => {
      const tIdx = uniqueTasks.findIndex((t) => t.indices.includes(frameIdx));
      if (tIdx !== -1 && !priorityTaskSet.has(tIdx)) {
        priorityTaskSet.add(tIdx);
        orderedTasks.push(uniqueTasks[tIdx]);
      }
    };

    // Pass 0: first & last frames immediately
    addTaskContaining(0);
    addTaskContaining(TOTAL_FRAMES - 1);
    // Pass 1: evenly distributed keyframes so scrubbing works right away without saturating network
    for (let i = 0; i < TOTAL_FRAMES; i += 10) {
      addTaskContaining(i);
    }
    // Pass 2: remaining frames for full 300-frame smoothness
    uniqueTasks.forEach((task, idx) => {
      if (!priorityTaskSet.has(idx)) {
        orderedTasks.push(task);
      }
    });

    let completedUnique = 0;
    const totalUnique = orderedTasks.length;
    let cursor = 0;
    const CONCURRENCY = 4;

    const loadTask = (task: { url: string; indices: number[] }) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';

        const finish = (ok: boolean) => {
          if (cancelled) {
            resolve();
            return;
          }
          if (ok) {
            for (const frameIdx of task.indices) {
              frameImagesRef.current[frameIdx] = img;
              loadedMaskRef.current[frameIdx] = true;
            }
            if (task.indices.includes(0)) {
              setFirstFrameReady(true);
              drawFrameToCanvas(Math.round(targetFrameRef.current), true);
            } else {
              const current = Math.round(currentFrameRef.current);
              if (!loadedMaskRef.current[current] || task.indices.includes(current)) {
                drawFrameToCanvas(current, false);
              }
            }
          }
          completedUnique++;
          if (completedUnique % 6 === 0 || completedUnique === totalUnique) {
            setLoadProgress(Math.round((completedUnique / totalUnique) * 100));
          }
          resolve();
        };

        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = task.url;
      });

    const runWorker = async () => {
      while (!cancelled && cursor < orderedTasks.length) {
        const idx = cursor++;
        await loadTask(orderedTasks[idx]);
      }
    };

    const start = async () => {
      if (orderedTasks.length > 0) {
        cursor = 1;
        await loadTask(orderedTasks[0]);
      }
      if (cancelled) return;
      // Brief yield so critical storefront UI & catalog paint first
      await new Promise((r) => setTimeout(r, 60));
      if (cancelled) return;
      const workers = Array.from({ length: CONCURRENCY }, () => runWorker());
      await Promise.all(workers);
    };

    start();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep canvas crisp on resize / mobile orientation change without per-scroll reflows
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateMetrics = () => {
      const rect = stage.getBoundingClientRect();
      const stickyTop =
        parseFloat(window.getComputedStyle(stage).top) ||
        (window.innerWidth >= 640 ? 72 : 64);
      stageMetricsRef.current = {
        width: rect.width,
        height: rect.height,
        stickyTop,
      };
      drawFrameToCanvas(Math.round(currentFrameRef.current), true);
    };

    updateMetrics();
    const ro = new ResizeObserver(updateMetrics);
    ro.observe(stage);

    return () => ro.disconnect();
  }, []);

  // Scroll + touch scrubbing (starts immediately on finger scroll, fades texts in contrast)
  useEffect(() => {
    const stepAnimation = () => {
      const frameDiff = targetFrameRef.current - currentFrameRef.current;
      const ratioDiff = targetRatioRef.current - currentRatioRef.current;

      if (reducedMotion || (Math.abs(frameDiff) < 0.08 && Math.abs(ratioDiff) < 0.002)) {
        currentFrameRef.current = targetFrameRef.current;
        currentRatioRef.current = targetRatioRef.current;
        drawFrameToCanvas(Math.round(currentFrameRef.current));
        applyContrastFade(currentRatioRef.current);
        rafRef.current = null;
        return;
      }

      currentFrameRef.current += frameDiff * 0.28;
      currentRatioRef.current += ratioDiff * 0.28;
      drawFrameToCanvas(Math.round(currentFrameRef.current));
      applyContrastFade(currentRatioRef.current);
      rafRef.current = requestAnimationFrame(stepAnimation);
    };

    const computeScrollTarget = () => {
      const container = containerRef.current;
      const stage = stageRef.current;
      if (!container || !stage) return;

      const computedTop = stageMetricsRef.current.stickyTop;
      const stageHeight = stageMetricsRef.current.height || stage.offsetHeight;
      const rect = container.getBoundingClientRect();
      const initialOffset = Math.max(computedTop, container.offsetTop);
      const scrollableDistance = Math.max(
        1,
        (initialOffset - computedTop) + (container.offsetHeight - stageHeight)
      );
      const traveled = initialOffset - rect.top;
      const ratio = Math.max(0, Math.min(1, traveled / scrollableDistance));

      targetRatioRef.current = ratio;
      targetFrameRef.current = ratio * (TOTAL_FRAMES - 1);

      if (reducedMotion) {
        currentFrameRef.current = targetFrameRef.current;
        currentRatioRef.current = targetRatioRef.current;
        drawFrameToCanvas(Math.round(currentFrameRef.current));
        applyContrastFade(currentRatioRef.current);
      } else if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(stepAnimation);
      }
    };

    computeScrollTarget();
    window.addEventListener('scroll', computeScrollTarget, { passive: true });
    document.addEventListener('scroll', computeScrollTarget, { passive: true, capture: true });
    window.addEventListener('touchmove', computeScrollTarget, { passive: true });
    document.addEventListener('touchmove', computeScrollTarget, { passive: true, capture: true });
    window.addEventListener('wheel', computeScrollTarget, { passive: true });
    window.addEventListener('resize', computeScrollTarget, { passive: true });

    return () => {
      window.removeEventListener('scroll', computeScrollTarget);
      document.removeEventListener('scroll', computeScrollTarget, { capture: true });
      window.removeEventListener('touchmove', computeScrollTarget);
      document.removeEventListener('touchmove', computeScrollTarget, { capture: true });
      window.removeEventListener('wheel', computeScrollTarget);
      window.removeEventListener('resize', computeScrollTarget);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [reducedMotion]);

  return (
    <section
      ref={containerRef}
      aria-label="Banner animado Tropicália Açaí"
      className="relative z-10 w-full bg-[#2E0A3A] h-[270vh] sm:h-[320vh]"
    >
      <div
        ref={stageRef}
        className="sticky top-16 sm:top-[72px] h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-72px)] w-full overflow-hidden bg-[#2E0A3A] touch-pan-y"
      >
        {/* Fullscreen responsive Canvas */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none touch-pan-y absolute inset-0 w-full h-full block will-change-transform"
        />

        {/* Subtle depth dimming veil as the menu sheet rises over the final frames */}
        <div
          ref={exitDimRef}
          aria-hidden="true"
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-[#1B0524] will-change-[opacity]"
        />

        {/* Contrast scrim that lifts away as the user starts scrolling */}
        <div
          ref={scrimLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 will-change-[opacity]"
        >
          <div className="absolute inset-0 bg-[#1B0524]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B0524]/85 via-[#1B0524]/25 to-[#1B0524]/30" />
        </div>

        {/* Loading pill before first frame paints */}
        {!firstFrameReady && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-[#2E0A3A]/75 text-[#FFF4DC] font-hero-sans text-xs font-bold backdrop-blur-sm">
            Carregando animação {loadProgress}%
          </div>
        )}

        {/* Hero layout & copy that smoothly fades out in contrast as the user scrolls */}
        <div
          ref={textLayerRef}
          className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-10 flex flex-col justify-between pointer-events-none will-change-[opacity,transform]"
        >
          {/* Top bar (clean spacer without eyebrow text) */}
          <div className="flex items-center justify-end gap-3">
            {loadProgress < 100 && firstFrameReady && (
              <div className="hidden sm:inline-flex items-center gap-2 font-hero-sans text-[11px] font-bold text-[#FFF4DC]/90 drop-shadow-[0_1px_6px_rgba(18,3,24,0.9)]">
                Carregando HD · {loadProgress}%
              </div>
            )}
          </div>

          {/* Bottom hero text + actions + scroll cue */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div
              ref={interactiveGroupRef}
              className="pointer-events-auto max-w-xl space-y-3 sm:space-y-4"
            >
              <h1 className="font-hero-serif font-bold text-[30px] sm:text-5xl lg:text-[54px] leading-[1.06] tracking-[-0.02em] text-[#FFF4DC] [text-wrap:balance] drop-shadow-[0_3px_14px_rgba(18,3,24,0.95)]">
                Monte o seu açaí do jeito que você ama.
              </h1>

              <p className="font-hero-sans text-sm sm:text-lg text-[#FFF4DC]/95 max-w-lg leading-relaxed drop-shadow-[0_2px_10px_rgba(18,3,24,0.95)]">
                Escolha cada camada, acompanhe o pedido ao vivo e receba em casa em{' '}
                <span className="font-extrabold text-[#F7B518]">{estimatedTime}</span>.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 font-hero-sans">
                <button
                  type="button"
                  onClick={onOpenBuilder}
                  className="group min-h-[48px] sm:min-h-[54px] px-6 sm:px-7 rounded-full bg-gradient-to-r from-[#F7B518] to-[#FFD45C] text-[#2E0A3A] font-extrabold text-sm sm:text-base shadow-xl shadow-black/35 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Montar meu açaí
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={onViewMenu}
                  className="min-h-[48px] sm:min-h-[54px] px-5 sm:px-6 rounded-full bg-[#2E0A3A]/75 hover:bg-[#4A1259]/90 border border-[#FFF4DC]/30 text-[#FFF4DC] font-bold text-sm sm:text-base backdrop-blur-sm shadow-lg transition-colors cursor-pointer"
                >
                  Ver cardápio completo
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 font-hero-sans text-xs sm:text-sm font-semibold text-[#FFF4DC]/95 drop-shadow-[0_2px_8px_rgba(18,3,24,0.95)]">
                <span className="inline-flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F7B518]" />
                  Mais de 3 anos de sabor
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F7B518]" />
                  Acompanhe ao vivo
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F7B518]" />
                  Pague com Pix
                </span>
              </div>
            </div>

            {/* Scroll prompt indicator */}
            <div
              ref={scrollCueRef}
              className="self-start lg:self-end inline-flex items-center gap-2 font-hero-sans text-xs sm:text-sm font-bold text-[#FFF4DC] drop-shadow-[0_2px_8px_rgba(18,3,24,0.95)] will-change-[opacity]"
            >
              <span>Role para baixo</span>
              <ArrowDown
                className={`w-4 h-4 text-[#F7B518] ${reducedMotion ? '' : 'animate-bounce'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

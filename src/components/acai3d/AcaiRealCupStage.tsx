import React, { useEffect, useRef, useState } from 'react';
import {
  getIngredientSprites,
  preloadBuilderRealPhotos,
  REAL_BOWL_BASE_PHOTO,
  REAL_CUP_BASE_PHOTO,
} from '../../utils/ingredientThumbnails';

export interface StageIngredientItem {
  key: string;
  stepId: 'creme' | 'calda' | 'fruta' | 'grao' | 'adicionais';
  itemId: string;
  name: string;
  color?: string;
}

interface AcaiRealCupStageProps {
  vesselKind: 'copo' | 'tigela';
  sizeId: string;
  sizeLabel: string;
  acaiId: string;
  acaiColor?: string;
  logoUrl?: string;
  activeIngredients: StageIngredientItem[];
  landingPulse?: number;
}

interface MouthEllipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  safeRx: number;
  safeRy: number;
}

interface PhysicsPiece {
  id: string;
  ingredientKey: string;
  src: string;
  isPowder: boolean;
  isSyrup: boolean;
  isCream: boolean;
  powderColor?: string;
  // Normalized coordinates inside the rim ellipse (-1..1), invariant across vessel switches
  normX: number;
  normY: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  sizePct: number;
  startRotZ: number;
  targetRotZ: number;
  tiltX: number;
  tiltY: number;
  spawnTime: number;
  delayMs: number;
  fallMs: number;
  bounceMs: number;
  bounceHeight: number;
  settled: boolean;
  zIndex: number;
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getVesselScale(vesselKind: 'copo' | 'tigela', sizeId: string): number {
  const id = sizeId.toLowerCase();
  if (vesselKind === 'copo') {
    if (id.includes('250')) return 0.85;
    if (id.includes('300')) return 0.89;
    if (id.includes('400')) return 0.93;
    if (id.includes('500')) return 0.97;
    return 1.01;
  }
  if (id.endsWith('-p')) return 0.92;
  if (id.endsWith('-m')) return 0.98;
  if (id.endsWith('-g')) return 1.03;
  return 1.07;
}

function getMouthGeometry(vesselKind: 'copo' | 'tigela'): MouthEllipse {
  if (vesselKind === 'copo') {
    // Calibrated to real_acai_cup_topdown_v2 (896x1200): inner acai surface spans x=16.5..83.5%, y=22..58%
    return {
      cx: 50,
      cy: 39.0,
      rx: 33.5,
      ry: 17.5,
      safeRx: 23.5,
      safeRy: 11.2,
    };
  }
  // Calibrated to real_acai_bowl_topdown_base (896x1200): inner acai surface spans x=14..86%, y=28..81%
  return {
    cx: 50,
    cy: 54.2,
    rx: 36.0,
    ry: 26.5,
    safeRx: 26.5,
    safeRy: 19.2,
  };
}

interface IngredientSpawnProfile {
  count: number;
  minSizeCopo: number;
  maxSizeCopo: number;
  minSizeTigela: number;
  maxSizeTigela: number;
  fallBaseMs: number;
  staggerStepMs: number;
  bounceHeight: number;
  isPowder: boolean;
  isSyrup: boolean;
  isCream: boolean;
  zBase: number;
}

function getSpawnProfile(ing: StageIngredientItem): IngredientSpawnProfile {
  const id = ing.itemId.toLowerCase();

  if (ing.stepId === 'calda') {
    return {
      count: 2,
      minSizeCopo: 15.5,
      maxSizeCopo: 18.5,
      minSizeTigela: 22.0,
      maxSizeTigela: 26.5,
      fallBaseMs: 490,
      staggerStepMs: 110,
      bounceHeight: 0.6,
      isPowder: false,
      isSyrup: true,
      isCream: false,
      zBase: 55,
    };
  }

  if (
    id === 'ext-leite-po' ||
    id === 'ext-leite-po-ninho' ||
    id === 'ext-farinha-lactea' ||
    id === 'creme-ninho'
  ) {
    return {
      count: 22,
      minSizeCopo: 2.8,
      maxSizeCopo: 5.6,
      minSizeTigela: 4.0,
      maxSizeTigela: 8.0,
      fallBaseMs: 650,
      staggerStepMs: 20,
      bounceHeight: 0.25,
      isPowder: true,
      isSyrup: false,
      isCream: false,
      zBase: 14,
    };
  }

  if (ing.stepId === 'creme' || id === 'ext-nutella' || id === 'ext-creme-pistache' || id === 'ext-pasta-amendoim' || id === 'ext-creme-ovomaltine') {
    return {
      count: 2,
      minSizeCopo: 11.5,
      maxSizeCopo: 14.0,
      minSizeTigela: 16.0,
      maxSizeTigela: 19.5,
      fallBaseMs: 470,
      staggerStepMs: 95,
      bounceHeight: 0.7,
      isPowder: false,
      isSyrup: false,
      isCream: true,
      zBase: 18,
    };
  }

  if (id.includes('granola')) {
    return {
      count: 16,
      minSizeCopo: 4.0,
      maxSizeCopo: 7.0,
      minSizeTigela: 5.6,
      maxSizeTigela: 9.8,
      fallBaseMs: 450,
      staggerStepMs: 26,
      bounceHeight: 1.4,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 28,
    };
  }

  if (id.includes('pacoca') || id.includes('farinha-amendoim')) {
    return {
      count: 15,
      minSizeCopo: 3.6,
      maxSizeCopo: 6.8,
      minSizeTigela: 5.0,
      maxSizeTigela: 9.2,
      fallBaseMs: 460,
      staggerStepMs: 24,
      bounceHeight: 1.1,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 28,
    };
  }

  if (id.includes('sucrilhos') || id.includes('cereal') || id.includes('flocos') || id.includes('neston')) {
    return {
      count: 13,
      minSizeCopo: 4.2,
      maxSizeCopo: 6.8,
      minSizeTigela: 5.8,
      maxSizeTigela: 9.4,
      fallBaseMs: 460,
      staggerStepMs: 28,
      bounceHeight: 1.4,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 28,
    };
  }

  if (id === 'fruta-morango' || id === 'fruta-kiwi') {
    return {
      count: 5,
      minSizeCopo: 8.6,
      maxSizeCopo: 10.6,
      minSizeTigela: 11.8,
      maxSizeTigela: 14.8,
      fallBaseMs: 440,
      staggerStepMs: 65,
      bounceHeight: 1.6,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 36,
    };
  }

  if (id === 'fruta-banana') {
    return {
      count: 6,
      minSizeCopo: 8.0,
      maxSizeCopo: 9.8,
      minSizeTigela: 11.0,
      maxSizeTigela: 13.8,
      fallBaseMs: 440,
      staggerStepMs: 60,
      bounceHeight: 1.5,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 36,
    };
  }

  if (id === 'fruta-uva' || id === 'fruta-maca') {
    return {
      count: 7,
      minSizeCopo: 5.4,
      maxSizeCopo: 7.2,
      minSizeTigela: 7.6,
      maxSizeTigela: 10.2,
      fallBaseMs: 430,
      staggerStepMs: 52,
      bounceHeight: 1.7,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 36,
    };
  }

  if (id === 'ext-canudinho') {
    return {
      count: 2,
      minSizeCopo: 12.0,
      maxSizeCopo: 13.5,
      minSizeTigela: 16.5,
      maxSizeTigela: 18.5,
      fallBaseMs: 470,
      staggerStepMs: 95,
      bounceHeight: 1.2,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 44,
    };
  }

  if (
    id.includes('mms') ||
    id.includes('disquete') ||
    id.includes('gotas') ||
    id.includes('bolinhas') ||
    id.includes('amendoim') ||
    id.includes('ovomaltine') ||
    id.includes('jujuba')
  ) {
    return {
      count: 12,
      minSizeCopo: 4.2,
      maxSizeCopo: 6.4,
      minSizeTigela: 5.8,
      maxSizeTigela: 8.8,
      fallBaseMs: 440,
      staggerStepMs: 30,
      bounceHeight: 1.6,
      isPowder: false,
      isSyrup: false,
      isCream: false,
      zBase: 38,
    };
  }

  // Chunky bars, Mini Oreo, Marshmallows, Cashews, Fini gummies
  return {
    count: 6,
    minSizeCopo: 6.4,
    maxSizeCopo: 8.6,
    minSizeTigela: 8.8,
    maxSizeTigela: 12.0,
    fallBaseMs: 450,
    staggerStepMs: 55,
    bounceHeight: 1.5,
    isPowder: false,
    isSyrup: false,
    isCream: false,
    zBase: 40,
  };
}

/**
 * Picks an open spot strictly inside the vessel's inner elliptical rim,
 * avoiding overlap with already-landed pieces so toppings distribute organically.
 */
function findAvailableNormalizedSpot(
  occupied: Array<{ nx: number; ny: number }>,
  rng: () => number,
  spreadBias: 'center' | 'wide'
): { nx: number; ny: number } {
  let bestNx = 0;
  let bestNy = 0;
  let bestScore = -1;

  const maxRadius = spreadBias === 'center' ? 0.62 : 0.92;
  const candidates = 28;

  for (let c = 0; c < candidates; c += 1) {
    const angle = rng() * Math.PI * 2;
    const rad = Math.sqrt(rng()) * maxRadius;
    const nx = Math.cos(angle) * rad;
    const ny = Math.sin(angle) * rad;

    if (occupied.length === 0) {
      return { nx, ny };
    }

    let minDistSq = Infinity;
    for (let j = 0; j < occupied.length; j += 1) {
      const dx = nx - occupied[j].nx;
      const dy = ny - occupied[j].ny;
      const dSq = dx * dx + dy * dy;
      if (dSq < minDistSq) minDistSq = dSq;
    }

    // Small random jitter prevents rigid grid patterns while still preferring open spots
    const score = minDistSq + rng() * 0.02;
    if (score > bestScore) {
      bestScore = score;
      bestNx = nx;
      bestNy = ny;
    }
  }

  return { nx: bestNx, ny: bestNy };
}

export const AcaiRealCupStage: React.FC<AcaiRealCupStageProps> = ({
  vesselKind,
  sizeId,
  sizeLabel,
  acaiId,
  logoUrl = '/assets/aistudio/image_82f9cbd7.png',
  activeIngredients,
  landingPulse = 0,
}) => {
  const clipId = React.useId().replace(/:/g, '_');
  const piecesByKeyRef = useRef<Map<string, PhysicsPiece[]>>(new Map());
  const prevVesselKindRef = useRef<'copo' | 'tigela'>(vesselKind);
  const [spritesReady, setSpritesReady] = useState(false);
  const [, setTick] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const [impactRipple, setImpactRipple] = useState<{ x: number; y: number; key: number } | null>(
    null
  );
  const lastPulseKeyRef = useRef(0);

  useEffect(() => {
    let active = true;
    preloadBuilderRealPhotos().then(() => {
      if (active) setSpritesReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const mouth = getMouthGeometry(vesselKind);
  const vesselScale = getVesselScale(vesselKind, sizeId);

  // Trigger subtle vessel bounce when user switches size/flavor externally
  useEffect(() => {
    if (landingPulse === 0) return;
    setBouncing(true);
    const t = window.setTimeout(() => setBouncing(false), 240);
    return () => clearTimeout(t);
  }, [landingPulse]);

  // Remap existing landed pieces cleanly if user switches between Copo <-> Tigela without re-dropping
  useEffect(() => {
    const prevKind = prevVesselKindRef.current;
    if (prevKind === vesselKind) return;
    prevVesselKindRef.current = vesselKind;
    const nextMouth = getMouthGeometry(vesselKind);
    const sizeFactor = vesselKind === 'copo' ? 0.72 : 1 / 0.72;
    piecesByKeyRef.current.forEach((pieces) => {
      pieces.forEach((p) => {
        p.targetX = nextMouth.cx + p.normX * nextMouth.safeRx;
        p.targetY = nextMouth.cy + p.normY * nextMouth.safeRy;
        p.startX = p.targetX;
        p.startY = Math.max(3, p.targetY - (vesselKind === 'copo' ? 28 : 36));
        p.sizePct = p.sizePct * sizeFactor;
        p.tiltX = vesselKind === 'copo' ? (p.isSyrup || p.isCream ? 26 : 18) : 4;
        p.zIndex = Math.round((p.normY + 1) * 20) + (p.isSyrup ? 55 : p.isPowder ? 14 : 28);
      });
    });
    setTick((n) => n + 1);
  }, [vesselKind]);

  // Incrementally spawn ONLY newly added ingredients & remove ONLY deselected ones
  useEffect(() => {
    const activeKeys = new Set(activeIngredients.map((i) => i.key));
    let changed = false;

    // Remove deselected ingredients without disturbing remaining ones
    for (const existingKey of Array.from(piecesByKeyRef.current.keys())) {
      if (!activeKeys.has(existingKey)) {
        piecesByKeyRef.current.delete(existingKey);
        changed = true;
      }
    }

    // Collect currently occupied positions across all retained pieces
    const occupied: Array<{ nx: number; ny: number }> = [];
    piecesByKeyRef.current.forEach((list) => {
      list.forEach((p) => occupied.push({ nx: p.normX, ny: p.normY }));
    });

    const now = performance.now();
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    for (const ing of activeIngredients) {
      if (piecesByKeyRef.current.has(ing.key)) continue;

      const sprites = getIngredientSprites(ing.stepId, {
        id: ing.itemId,
        name: ing.name,
        color: ing.color,
      });
      if (sprites.length === 0) continue;

      const profile = getSpawnProfile(ing);
      const rng = mulberry32(hashString(ing.key));
      const spawned: PhysicsPiece[] = [];
      const currentMouth = getMouthGeometry(vesselKind);

      for (let i = 0; i < profile.count; i += 1) {
        const spriteSrc = sprites[i % sprites.length];
        const spot = findAvailableNormalizedSpot(
          occupied,
          rng,
          profile.isCream || profile.isSyrup ? 'center' : 'wide'
        );
        occupied.push(spot);

        const targetX = currentMouth.cx + spot.nx * currentMouth.safeRx;
        const targetY = currentMouth.cy + spot.ny * currentMouth.safeRy;

        // Start directly above the cup/bowl opening within horizontal rim bounds (never outside vessel!)
        const driftX = (rng() - 0.5) * 4.5;
        const startX = Math.max(
          currentMouth.cx - currentMouth.safeRx * 0.85,
          Math.min(currentMouth.cx + currentMouth.safeRx * 0.85, targetX + driftX)
        );
        const startY = Math.max(3, targetY - (vesselKind === 'copo' ? 28 : 36) + rng() * 4);

        const baseMin = vesselKind === 'copo' ? profile.minSizeCopo : profile.minSizeTigela;
        const baseMax = vesselKind === 'copo' ? profile.maxSizeCopo : profile.maxSizeTigela;
        const depthScale = 0.94 + rng() * 0.12;
        const sizePct = (baseMin + rng() * (baseMax - baseMin)) * depthScale;

        const targetRotZ = profile.isSyrup
          ? 74 + (rng() - 0.5) * 28
          : (rng() - 0.5) * 44;

        const baseTiltX =
          vesselKind === 'copo'
            ? (profile.isSyrup || profile.isCream ? 24 : 16) + rng() * 10
            : 2 + rng() * 6;

        spawned.push({
          id: `${ing.key}-${i}`,
          ingredientKey: ing.key,
          src: spriteSrc,
          isPowder: profile.isPowder,
          isSyrup: profile.isSyrup,
          isCream: profile.isCream,
          powderColor: ing.color || '#FFF7E4',
          normX: spot.nx,
          normY: spot.ny,
          startX,
          startY,
          targetX,
          targetY,
          sizePct,
          startRotZ: targetRotZ + (rng() - 0.5) * 48,
          targetRotZ,
          tiltX: baseTiltX,
          tiltY: (rng() - 0.5) * 10,
          spawnTime: now,
          delayMs: reducedMotion ? 0 : i * profile.staggerStepMs + rng() * 18,
          fallMs: reducedMotion ? 1 : profile.fallBaseMs + (rng() - 0.5) * 70,
          bounceMs: reducedMotion ? 0 : profile.isPowder ? 70 : 150,
          bounceHeight: profile.bounceHeight,
          settled: reducedMotion,
          zIndex: profile.zBase + Math.round((spot.ny + 1) * 12),
        });
      }

      piecesByKeyRef.current.set(ing.key, spawned);
      changed = true;
    }

    if (changed) {
      setTick((n) => n + 1);
    }
  }, [activeIngredients, vesselKind, spritesReady]);

  // Unified 60fps gravity + impact animation loop (runs ONLY while pieces are falling/bouncing)
  const allPieces: PhysicsPiece[] = [];
  piecesByKeyRef.current.forEach((list) => {
    for (let i = 0; i < list.length; i += 1) {
      allPieces.push(list[i]);
    }
  });
  const hasActiveMotion = allPieces.some((p) => !p.settled);

  useEffect(() => {
    if (!hasActiveMotion) return;
    let rafId = 0;
    const step = () => {
      const now = performance.now();
      let stillMoving = false;
      let triggeredImpactThisFrame = false;

      piecesByKeyRef.current.forEach((list) => {
        for (let i = 0; i < list.length; i += 1) {
          const p = list[i];
          if (p.settled) continue;

          const elapsed = now - (p.spawnTime + p.delayMs);
          if (elapsed < p.fallMs + p.bounceMs) {
            stillMoving = true;
            if (elapsed >= p.fallMs && elapsed - p.fallMs < 24 && !triggeredImpactThisFrame) {
              triggeredImpactThisFrame = true;
              const k = Math.round(now);
              if (k - lastPulseKeyRef.current > 180) {
                lastPulseKeyRef.current = k;
                setBouncing(true);
                if (!p.isPowder) {
                  setImpactRipple({ x: p.targetX, y: p.targetY, key: k });
                }
                window.setTimeout(() => setBouncing(false), 200);
              }
            }
          } else {
            p.settled = true;
          }
        }
      });

      setTick((n) => n + 1);
      if (stillMoving) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [hasActiveMotion]);

  // Sort back-to-front by vertical position & category layer for accurate 3D occlusion
  const sortedPieces = [...allPieces].sort((a, b) => {
    if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
    return a.targetY - b.targetY;
  });

  const acaiTintOverlay =
    acaiId === 'acai-morango'
      ? 'rgba(218, 42, 92, 0.25)'
      : acaiId === 'acai-banana'
      ? 'rgba(245, 200, 82, 0.16)'
      : null;

  const now = performance.now();

  return (
    <div className="relative w-full h-full min-h-[230px] overflow-hidden rounded-2xl lg:rounded-3xl border border-[#F7B518]/25 bg-[#24062C] shadow-2xl flex items-center justify-center select-none">
      {/* Subtle volume + brand badge */}
      <div className="pointer-events-none absolute top-3 left-3 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D0424]/85 border border-[#F7B518]/35 text-[11px] font-bold text-[#F7B518]">
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-4 h-4 rounded-full object-cover"
          />
        )}
        <span>{sizeLabel}</span>
      </div>

      {/* Aspect-locked 3:4 studio frame matching the top-down cup & ceramic bowl photos */}
      <div
        className="relative h-full max-h-full aspect-[3/4] transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${vesselScale * (bouncing ? 0.985 : 1)}, ${
            vesselScale * (bouncing ? 0.968 : 1)
          })`,
        }}
      >
        <img
          src={vesselKind === 'copo' ? REAL_CUP_BASE_PHOTO : REAL_BOWL_BASE_PHOTO}
          alt={vesselKind === 'copo' ? 'Copo cheio de açaí cremoso' : 'Tigela cheia de açaí cremoso'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-xl pointer-events-none"
        />

        {/* Base acai flavor subtle tint on open acai surface */}
        {acaiTintOverlay && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] mix-blend-soft-light transition-colors duration-300"
            style={{
              left: `${mouth.cx}%`,
              top: `${mouth.cy}%`,
              width: `${mouth.rx * 1.9}%`,
              height: `${mouth.ry * 2.0}%`,
              backgroundColor: acaiTintOverlay,
            }}
          />
        )}

        {/* Localized surface impact ripple on touchdown */}
        {impactRipple && (
          <div
            key={impactRipple.key}
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#FFF4DC]/45 animate-ping"
            style={{
              left: `${impactRipple.x}%`,
              top: `${impactRipple.y}%`,
              width: vesselKind === 'copo' ? '12%' : '16%',
              height: vesselKind === 'copo' ? '4%' : '7%',
              zIndex: 49,
            }}
          />
        )}

        {/* SVG ClipPath following the exact lower elliptical rim so toppings stay strictly inside the cup/bowl */}
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path
                d={
                  vesselKind === 'copo'
                    ? 'M 0.15 0 L 0.165 0.392 A 0.335 0.175 0 0 0 0.835 0.392 L 0.85 0 Z'
                    : 'M 0.12 0 L 0.14 0.542 A 0.360 0.265 0 0 0 0.86 0.542 L 0.88 0 Z'
                }
              />
            </clipPath>
          </defs>
        </svg>

        {/* Falling + Permanently Landed Realistic 3D Toppings */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
          style={{ clipPath: `url(#${clipId})` }}
        >
          {sortedPieces.map((piece) => {
            let x = piece.targetX;
            let y = piece.targetY;
            let rotZ = piece.targetRotZ;
            let rotX = piece.tiltX;
            let rotY = piece.tiltY;
            let scaleX = 1;
            let scaleY = 1;
            let shadowOpacity = piece.isPowder ? 0.2 : 0.58;
            let pieceOpacity = piece.isPowder ? 0.88 : 1;

            if (!piece.settled) {
              const elapsed = now - (piece.spawnTime + piece.delayMs);
              if (elapsed < 0) return null;

              if (elapsed < piece.fallMs) {
                // Gravity acceleration downward from above the cup rim
                const p = elapsed / piece.fallMs;
                const grav = p * p;
                x = piece.startX + (piece.targetX - piece.startX) * p;
                y = piece.startY + (piece.targetY - piece.startY) * grav;
                rotZ = piece.startRotZ + (piece.targetRotZ - piece.startRotZ) * p;
                rotX = piece.tiltX + (1 - p) * 24;
                rotY = piece.tiltY + (1 - p) * 20;
                const airScale = 1.28 - 0.28 * p;
                scaleX = airScale;
                scaleY = airScale;
                shadowOpacity = Math.max(0, (p - 0.35) / 0.65) * (piece.isPowder ? 0.2 : 0.55);
                pieceOpacity = Math.min(1, p * 4.5) * (piece.isPowder ? 0.88 : 1);
              } else if (elapsed < piece.fallMs + piece.bounceMs) {
                // Touchdown impact squash & damped bounce onto the acai surface
                const bp = (elapsed - piece.fallMs) / piece.bounceMs;
                const lift = Math.sin(bp * Math.PI) * piece.bounceHeight * (1 - bp * 0.35);
                y = piece.targetY - lift;
                if (bp < 0.45) {
                  const sq = Math.sin((bp / 0.45) * Math.PI) * (piece.isPowder ? 0.04 : 0.14);
                  scaleY = 1 - sq;
                  scaleX = 1 + sq * 0.65;
                }
              }
            }

            const shadowW = piece.sizePct * 0.78;
            const shadowH = piece.sizePct * (vesselKind === 'copo' ? 0.32 : 0.42);

            return (
              <React.Fragment key={piece.id}>
                {/* Realistic contact shadow anchored directly beneath the ingredient on the acai surface */}
                {shadowOpacity > 0.02 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${piece.targetY + piece.sizePct * 0.1}%`,
                      width: `${shadowW}%`,
                      height: `${shadowH}%`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(ellipse at center, rgba(16, 2, 24, 0.68) 0%, rgba(16, 2, 24, 0.24) 58%, transparent 82%)',
                      opacity: shadowOpacity,
                      zIndex: piece.zIndex,
                    }}
                  />
                )}

                {piece.isPowder ? (
                  /* Delicate fine powder cloud / particle dusting onto the acai */
                  <div
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${piece.sizePct}%`,
                      height: `${piece.sizePct * 0.78}%`,
                      transform: `translate(-50%, -50%) scale(${scaleX}, ${scaleY}) rotate(${rotZ}deg)`,
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 42% 38%, rgba(255, 253, 246, 0.96) 0%, ${
                        piece.powderColor || 'rgba(255, 246, 224, 0.85)'
                      } 52%, rgba(255, 244, 220, 0) 85%)`,
                      filter: 'blur(0.6px)',
                      opacity: pieceOpacity,
                      zIndex: piece.zIndex + 1,
                    }}
                  />
                ) : (
                  <img
                    src={piece.src}
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${piece.sizePct}%`,
                      height: `${piece.sizePct}%`,
                      objectFit: 'contain',
                      transform: `translate(-50%, -50%) perspective(480px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scaleX}, ${scaleY})`,
                      filter: piece.isSyrup
                        ? 'drop-shadow(0 3px 4px rgba(14, 2, 22, 0.65))'
                        : 'drop-shadow(0 4px 5px rgba(14, 2, 22, 0.68))',
                      opacity: pieceOpacity,
                      zIndex: piece.zIndex + 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

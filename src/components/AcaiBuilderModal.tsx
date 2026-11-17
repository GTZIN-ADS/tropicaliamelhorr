import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import {
  BuilderConfig,
  BuilderOptionItem,
  BuilderSize,
  CartItem,
  CartItemSelection,
} from '../types';
import { formatBRL } from '../utils/format';
import {
  getIngredientThumbnail,
  getSizeThumbnail,
  preloadBuilderRealPhotos,
} from '../utils/ingredientThumbnails';
import { AcaiRealCupStage, StageIngredientItem } from './acai3d/AcaiRealCupStage';

const OptionPhoto: React.FC<{ src: string; alt: string; className: string }> = ({
  src,
  alt,
  className,
}) => {
  if (!src) {
    return <div className={`${className} bg-[#2E0A3A] skeleton-shimmer`} aria-hidden="true" />;
  }
  return <img src={src} alt={alt} referrerPolicy="no-referrer" className={className} />;
};

interface AcaiBuilderModalProps {
  open: boolean;
  config: BuilderConfig;
  initialSizeId?: string | null;
  logoUrl?: string;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const STEP_LABELS = [
  'Tamanho',
  'Açaí',
  'Creme',
  'Calda',
  'Fruta',
  'Grão',
  'Adicionais',
  'Resumo',
] as const;

function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (Math.abs(diff) < 0.01) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const totalFrames = 14;
    let rafId = 0;
    const tick = () => {
      frame += 1;
      const progress = Math.min(1, frame / totalFrames);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (frame < totalFrames) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  const formatted = formatBRL(display);
  return (
    <span className="font-display font-bold text-[#F7B518] tabular-nums inline-flex items-start">
      <span className="text-xs mr-0.5 mt-0.5">R$</span>
      <span className="text-2xl sm:text-[26px] leading-none">{formatted}</span>
    </span>
  );
}

export const AcaiBuilderModal: React.FC<AcaiBuilderModalProps> = ({
  open,
  config,
  initialSizeId,
  logoUrl = '/assets/aistudio/image_82f9cbd7.png',
  onClose,
  onAddToCart,
}) => {
  const allSizes = useMemo(
    () => [...config.sizes, ...config.doseDupla].filter((s) => s.available),
    [config]
  );

  const defaultCupSizeId = useMemo(
    () =>
      allSizes.find((s) => s.id === 'copo-400')?.id ||
      allSizes.find((s) => s.kind === 'copo')?.id ||
      allSizes[0]?.id ||
      'copo-400',
    [allSizes]
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string>(defaultCupSizeId);
  const [selectedAcai, setSelectedAcai] = useState<string>('acai-puro');
  const [selectedCreme, setSelectedCreme] = useState<string | null>(null);
  const [selectedCaldas, setSelectedCaldas] = useState<string[]>([]);
  const [selectedFrutas, setSelectedFrutas] = useState<string[]>([]);
  const [selectedGrao, setSelectedGrao] = useState<string | null>(null);
  const [extrasQty, setExtrasQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [, setPhotosReady] = useState(false);
  const [landingPulse, setLandingPulse] = useState(0);

  useEffect(() => {
    let active = true;
    preloadBuilderRealPhotos().then(() => {
      if (active) setPhotosReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const target = initialSizeId
      ? allSizes.find((s) => s.id === initialSizeId) || allSizes[0]
      : allSizes.find((s) => s.id === 'copo-400') ||
        allSizes.find((s) => s.kind === 'copo') ||
        allSizes[0];
    if (target) setSelectedSizeId(target.id);
    setStepIdx(initialSizeId ? 1 : 0);
    setSelectedAcai(config.steps.find((s) => s.id === 'acai')?.items[0]?.id || 'acai-puro');
    setSelectedCreme(null);
    setSelectedCaldas([]);
    setSelectedFrutas([]);
    setSelectedGrao(null);
    setExtrasQty({});
    setNotes('');
    setQuantity(1);
    setLandingPulse(0);
  }, [open, initialSizeId, allSizes, config]);

  const currentSize: BuilderSize | undefined = useMemo(
    () => allSizes.find((s) => s.id === selectedSizeId) || allSizes[0],
    [allSizes, selectedSizeId]
  );

  const acaiStep = config.steps.find((s) => s.id === 'acai')!;
  const cremeStep = config.steps.find((s) => s.id === 'creme')!;
  const caldaStep = config.steps.find((s) => s.id === 'calda')!;
  const frutaStep = config.steps.find((s) => s.id === 'fruta')!;
  const graoStep = config.steps.find((s) => s.id === 'grao')!;
  const adicionaisStep = config.steps.find((s) => s.id === 'adicionais')!;

  const availableCaldas = useMemo(() => {
    const base = caldaStep.items.filter((i) => i.available);
    if (currentSize?.allowedCaldaIds && currentSize.allowedCaldaIds.length > 0) {
      return base.filter((i) => currentSize.allowedCaldaIds!.includes(i.id));
    }
    return base;
  }, [caldaStep, currentSize]);

  // Prune caldas if user switched to Dose Dupla
  useEffect(() => {
    const allowedIds = new Set(availableCaldas.map((c) => c.id));
    setSelectedCaldas((prev) => prev.filter((id) => allowedIds.has(id)));
  }, [availableCaldas]);

  const includedCaldas = currentSize?.includedCaldas ?? 1;
  const includedFrutas = currentSize?.includedFrutas ?? 1;
  const includedGraos = currentSize?.includedGraos ?? 1;
  const extraCaldaPrice = currentSize?.extraPrice ?? caldaStep.extraPrice ?? 3;
  const extraFrutaPrice = currentSize?.extraPrice ?? frutaStep.extraPrice ?? 3;

  const extraCaldasCount = Math.max(0, selectedCaldas.length - includedCaldas);
  const extraFrutasCount = Math.max(0, selectedFrutas.length - includedFrutas);

  const adicionaisTotal = useMemo(() => {
    return Object.entries(extrasQty).reduce((sum, [itemId, qty]) => {
      if (qty <= 0) return sum;
      const found = adicionaisStep.items.find((i) => i.id === itemId);
      return sum + (found ? found.price * qty : 0);
    }, 0);
  }, [extrasQty, adicionaisStep]);

  const unitPrice = useMemo(() => {
    const base = currentSize?.price || 0;
    return Number(
      (
        base +
        extraCaldasCount * extraCaldaPrice +
        extraFrutasCount * extraFrutaPrice +
        adicionaisTotal
      ).toFixed(2)
    );
  }, [currentSize, extraCaldasCount, extraCaldaPrice, extraFrutasCount, extraFrutaPrice, adicionaisTotal]);

  const acaiObj = acaiStep.items.find((i) => i.id === selectedAcai);
  const cremeObj = cremeStep.items.find((i) => i.id === selectedCreme);
  const caldaObjs = useMemo(
    () =>
      selectedCaldas
        .map((id) => availableCaldas.find((c) => c.id === id))
        .filter(Boolean) as BuilderOptionItem[],
    [selectedCaldas, availableCaldas]
  );
  const frutaObjs = useMemo(
    () =>
      selectedFrutas
        .map((id) => frutaStep.items.find((f) => f.id === id))
        .filter(Boolean) as BuilderOptionItem[],
    [selectedFrutas, frutaStep]
  );
  const graoObj = graoStep.items.find((i) => i.id === selectedGrao);
  const extraObjs = useMemo(
    () =>
      Object.entries(extrasQty)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => {
          const item = adicionaisStep.items.find((i) => i.id === id);
          return item ? { item, qty: q } : null;
        })
        .filter(Boolean) as { item: BuilderOptionItem; qty: number }[],
    [extrasQty, adicionaisStep]
  );

  // Real-time cumulative photo composition layered inside the real filled cup/bowl
  const stageIngredients = useMemo<StageIngredientItem[]>(() => {
    const specs: StageIngredientItem[] = [];
    if (cremeObj) {
      specs.push({
        key: `creme:${cremeObj.id}`,
        stepId: 'creme',
        itemId: cremeObj.id,
        name: cremeObj.name,
        color: cremeObj.color,
      });
    }
    for (const c of caldaObjs) {
      specs.push({
        key: `calda:${c.id}`,
        stepId: 'calda',
        itemId: c.id,
        name: c.name,
        color: c.color,
      });
    }
    for (const f of frutaObjs) {
      specs.push({
        key: `fruta:${f.id}`,
        stepId: 'fruta',
        itemId: f.id,
        name: f.name,
        color: f.color,
      });
    }
    if (graoObj) {
      specs.push({
        key: `grao:${graoObj.id}`,
        stepId: 'grao',
        itemId: graoObj.id,
        name: graoObj.name,
        color: graoObj.color,
      });
    }
    for (const { item, qty } of extraObjs) {
      const visualBatches = Math.min(qty, 4);
      for (let q = 1; q <= visualBatches; q += 1) {
        specs.push({
          key: `extra:${item.id}:${q}`,
          stepId: 'adicionais',
          itemId: item.id,
          name: item.name,
          color: item.color,
        });
      }
    }
    return specs;
  }, [cremeObj, caldaObjs, frutaObjs, graoObj, extraObjs]);

  if (!open || !currentSize) return null;

  const toggleCalda = (id: string) => {
    setSelectedCaldas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleFruta = (id: string) => {
    setSelectedFrutas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const changeExtraQty = (id: string, delta: number) => {
    setExtrasQty((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleFinish = () => {
    const selections: CartItemSelection[] = [
      {
        groupTitle: 'Base',
        items: [
          { name: `${currentSize.name} · Leite em pó incluso`, quantity: 1, extraPrice: 0 },
          ...(acaiObj ? [{ name: acaiObj.name, quantity: 1, extraPrice: 0 }] : []),
        ],
      },
    ];
    if (cremeObj) {
      selections.push({
        groupTitle: 'Creme',
        items: [{ name: cremeObj.name, quantity: 1, extraPrice: 0 }],
      });
    }
    if (caldaObjs.length > 0) {
      selections.push({
        groupTitle: 'Calda',
        items: caldaObjs.map((c, idx) => ({
          name: c.name,
          quantity: 1,
          extraPrice: idx >= includedCaldas ? extraCaldaPrice : 0,
        })),
      });
    }
    if (frutaObjs.length > 0) {
      selections.push({
        groupTitle: 'Fruta',
        items: frutaObjs.map((f, idx) => ({
          name: f.name,
          quantity: 1,
          extraPrice: idx >= includedFrutas ? extraFrutaPrice : 0,
        })),
      });
    }
    if (graoObj) {
      selections.push({
        groupTitle: 'Grão',
        items: [{ name: graoObj.name, quantity: 1, extraPrice: 0 }],
      });
    }
    if (extraObjs.length > 0) {
      selections.push({
        groupTitle: 'Adicionais',
        items: extraObjs.map(({ item, qty }) => ({
          name: item.name,
          quantity: qty,
          extraPrice: item.price * qty,
        })),
      });
    }

    onAddToCart({
      id: `builder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: currentSize.id,
      name: currentSize.isDoseDupla
        ? `${currentSize.name} (Dose Dupla)`
        : `Açaí Montável · ${currentSize.name}`,
      categoryName: currentSize.isDoseDupla ? 'Dose Dupla' : 'Açaí Montável',
      isBuilder: true,
      unitPrice,
      quantity,
      notes: notes.trim(),
      selections,
    });
    onClose();
  };

  const renderStepCounter = (
    current: number,
    included: number,
    extraUnitPrice: number,
    optional = false
  ) => {
    const done = optional ? current >= 0 && current <= included : current >= included;
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg tabular-nums transition-colors ${
            current >= included && included > 0
              ? 'bg-[#3DDC84]/20 text-[#3DDC84] border border-[#3DDC84]/30'
              : 'bg-[#62207A] text-[#FFF4DC]'
          }`}
        >
          {current >= included && included > 0 && <Check className="w-3.5 h-3.5" />}
          {included > 0
            ? `${Math.min(current, included)} de ${included} incluso(s)`
            : `${current} selecionado(s)`}
        </span>
        {done && current > included && included > 0 && (
          <span className="text-[#F7B518] tabular-nums">
            +{current - included} adicional (+ R$ {formatBRL((current - included) * extraUnitPrice)})
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/82 p-0 lg:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Montador de Açaí Tropicália"
    >
      <div className="relative w-full h-[97dvh] lg:h-[90vh] lg:max-w-6xl bg-[#2E0A3A] text-[#FFF4DC] rounded-t-[28px] lg:rounded-[28px] shadow-2xl border border-[#F7B518]/30 flex flex-col overflow-hidden">
        {/* Header + 8-Step Interactive Progress */}
        <div className="shrink-0 px-4 sm:px-6 pt-3.5 pb-3 border-b border-[#62207A]/70 bg-[#3B0F4A]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={logoUrl}
                alt="Tropicália Açaí"
                referrerPolicy="no-referrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#F7B518]/40 shrink-0 hidden sm:block"
              />
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-bold text-[#F7B518] tracking-wide truncate">
                  Tropicália Açaí · Etapa {stepIdx + 1} de {STEP_LABELS.length}
                </p>
                <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#FFF4DC] leading-tight truncate">
                  {STEP_LABELS[stepIdx]}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar montador"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#62207A] hover:bg-[#772A93] text-[#FFF4DC] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 8-Step Tab Bar */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {STEP_LABELS.map((label, idx) => {
              const active = idx === stepIdx;
              const passed = idx < stepIdx;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStepIdx(idx)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    active
                      ? 'bg-[#F7B518] text-[#2E0A3A] border-[#F7B518] shadow-sm shadow-[#F7B518]/30'
                      : passed
                      ? 'bg-[#3DDC84]/15 text-[#3DDC84] border-[#3DDC84]/30'
                      : 'bg-[#2E0A3A]/85 text-[#FFF4DC]/75 border-[#62207A]/60 hover:text-[#FFF4DC]'
                  }`}
                >
                  {passed ? '✓ ' : `${idx + 1}. `}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Stage: Real Filled Cup/Bowl Photo + Realistic Ingredient Cards */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
          {/* Interactive Real Cup/Bowl Column */}
          <div className="shrink-0 lg:col-span-5 p-3 sm:p-4 lg:p-5 lg:border-r border-b lg:border-b-0 border-[#62207A]/60 bg-[#270733] flex flex-col gap-2.5">
            <div className="w-full h-[255px] sm:h-[285px] lg:flex-1 lg:min-h-[390px]">
              <AcaiRealCupStage
                vesselKind={currentSize.kind}
                sizeId={currentSize.id}
                sizeLabel={currentSize.name}
                acaiId={acaiObj?.id || selectedAcai}
                acaiColor={acaiObj?.color || '#4A1259'}
                logoUrl={logoUrl}
                activeIngredients={stageIngredients}
                landingPulse={landingPulse}
              />
            </div>

            {/* Live Selected Composition Strip */}
            <div className="rounded-2xl bg-[#3A0E49]/90 border border-[#62207A]/80 px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#F7B518] truncate">
                  {currentSize.name} · {acaiObj?.name || 'Açaí'}
                </span>
                <span className="text-[11px] text-[#FFF4DC]/70 shrink-0 tabular-nums">
                  {stageIngredients.length + 1} item(ns) no copo
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#FFF4DC]/80 line-clamp-2 leading-relaxed">
                Leite em pó incluso
                {cremeObj ? ` · ${cremeObj.name}` : ''}
                {caldaObjs.map((c) => ` · ${c.name}`).join('')}
                {frutaObjs.map((f) => ` · ${f.name}`).join('')}
                {graoObj ? ` · ${graoObj.name}` : ''}
                {extraObjs.map(({ item, qty }) => ` · ${qty}x ${item.name}`).join('')}
              </p>
            </div>
          </div>

          {/* Right/Bottom Selection Area */}
          <div className="flex-1 min-h-0 lg:col-span-7 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#2E0A3A]">
            {stepIdx === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#FFF4DC] mb-1">
                    Copos e Tigelas Tradicionais
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FFF4DC]/75 mb-3">
                    Já acompanha açaí cremoso, leite em pó, {includedCaldas} calda, {includedGraos}{' '}
                    grão, {includedFrutas} fruta e 1 creme (opcional).
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {config.sizes
                      .filter((s) => s.available)
                      .map((sz) => {
                        const selected = selectedSizeId === sz.id;
                        const thumb = getSizeThumbnail(sz);
                        return (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => {
                              setSelectedSizeId(sz.id);
                              setLandingPulse((p) => p + 1);
                            }}
                            className={`relative group rounded-2xl border-2 p-2.5 text-center transition-all cursor-pointer flex flex-col items-center ${
                              selected
                                ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                                : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/60'
                            }`}
                          >
                            {selected && (
                              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                            <OptionPhoto
                              src={thumb}
                              alt={sz.name}
                              className="w-full h-24 object-cover rounded-xl mb-2"
                            />
                            <div className="font-display text-sm font-bold text-[#FFF4DC] leading-tight">
                              {sz.name}
                            </div>
                            <div className="text-xs font-extrabold text-[#F7B518] tabular-nums mt-0.5">
                              R$ {formatBRL(sz.price)}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B5E] text-white text-xs font-extrabold tracking-wide">
                      OFERTA ESPECIAL
                    </span>
                    <span className="font-script text-base text-[#F7B518]">
                      Uma delícia da casa, agora em dose dupla!
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.doseDupla
                      .filter((s) => s.available)
                      .map((sz) => {
                        const selected = selectedSizeId === sz.id;
                        const thumb = getSizeThumbnail(sz);
                        return (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => {
                              setSelectedSizeId(sz.id);
                              setLandingPulse((p) => p + 1);
                            }}
                            className={`relative rounded-2xl border-2 p-3 text-left transition-all cursor-pointer flex items-center gap-3 ${
                              selected
                                ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                                : 'bg-[#451155] border-[#F7B518]/35 hover:border-[#F7B518]'
                            }`}
                          >
                            {selected && (
                              <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                            <OptionPhoto
                              src={thumb}
                              alt={sz.name}
                              className="w-20 h-20 object-cover rounded-xl shrink-0"
                            />
                            <div className="min-w-0 pr-5">
                              <div className="font-display text-base font-extrabold text-[#FFF4DC]">
                                {sz.name}
                              </div>
                              <p className="text-[11px] text-[#FFF4DC]/75 mt-0.5 leading-snug">
                                {sz.description}
                              </p>
                              <div className="font-display text-sm font-bold text-[#F7B518] tabular-nums mt-1">
                                R$ {formatBRL(sz.price)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {stepIdx === 1 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#FFF4DC]/80">{acaiStep.subtitle}</p>
                  {renderStepCounter(selectedAcai ? 1 : 0, 1, 0)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {acaiStep.items
                    .filter((i) => i.available)
                    .map((item) => {
                      const active = selectedAcai === item.id;
                      const thumb = getIngredientThumbnail('acai', item);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedAcai(item.id);
                            setLandingPulse((p) => p + 1);
                          }}
                          className={`relative rounded-2xl border-2 p-2.5 text-center transition-all cursor-pointer flex flex-col items-center active:scale-[0.97] ${
                            active
                              ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                              : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/60'
                          }`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                          <OptionPhoto
                            src={thumb}
                            alt={item.name}
                            className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2"
                          />
                          <span className="font-bold text-sm text-[#FFF4DC] leading-snug">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-semibold text-[#3DDC84] mt-0.5">
                            Incluso na base
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {stepIdx === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#FFF4DC]/80">{cremeStep.subtitle}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCreme(null);
                      setStepIdx(3);
                    }}
                    className="min-h-[36px] px-3 rounded-xl bg-[#451155] border border-[#F7B518]/30 text-xs font-bold text-[#F7B518] hover:bg-[#5B1B72] cursor-pointer"
                  >
                    Pular creme →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cremeStep.items
                    .filter((i) => i.available)
                    .map((item) => {
                      const active = selectedCreme === item.id;
                      const thumb = getIngredientThumbnail('creme', item);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedCreme(active ? null : item.id)}
                          className={`relative rounded-2xl border-2 p-2.5 text-center transition-all cursor-pointer flex flex-col items-center active:scale-[0.97] ${
                            active
                              ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                              : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/60'
                          }`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                          <OptionPhoto
                            src={thumb}
                            alt={item.name}
                            className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2"
                          />
                          <div className="font-bold text-sm text-[#FFF4DC] leading-snug">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-semibold text-[#3DDC84] mt-0.5">
                            Incluso
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {stepIdx === 3 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#FFF4DC]/80">
                    {includedCaldas} calda inclusa ·{' '}
                    <span className="text-[#F7B518] font-bold">
                      + R$ {formatBRL(extraCaldaPrice)} por calda adicional
                    </span>
                  </p>
                  {renderStepCounter(selectedCaldas.length, includedCaldas, extraCaldaPrice, true)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {availableCaldas.map((item) => {
                    const active = selectedCaldas.includes(item.id);
                    const willCostExtra = !active && selectedCaldas.length >= includedCaldas;
                    const thumb = getIngredientThumbnail('calda', item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCalda(item.id)}
                        className={`relative rounded-2xl border-2 p-2 text-center transition-all cursor-pointer flex flex-col items-center active:scale-[0.97] ${
                          active
                            ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                            : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/60'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                        <OptionPhoto
                          src={thumb}
                          alt={item.name}
                          className="w-full h-24 sm:h-28 object-cover rounded-xl mb-1.5"
                        />
                        <div className="font-bold text-xs sm:text-[13px] text-[#FFF4DC] leading-tight line-clamp-2">
                          {item.name}
                        </div>
                        {willCostExtra ? (
                          <div className="text-[11px] text-[#F7B518] font-bold mt-0.5 tabular-nums">
                            + R$ {formatBRL(extraCaldaPrice)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#3DDC84] font-semibold mt-0.5">
                            {active ? 'Selecionada' : 'Inclusa'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {stepIdx === 4 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#FFF4DC]/80">
                    {includedFrutas} fruta(s) inclusa(s) ·{' '}
                    <span className="text-[#F7B518] font-bold">
                      + R$ {formatBRL(extraFrutaPrice)} por fruta adicional
                    </span>
                  </p>
                  {renderStepCounter(selectedFrutas.length, includedFrutas, extraFrutaPrice, true)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {frutaStep.items
                    .filter((i) => i.available)
                    .map((item) => {
                      const active = selectedFrutas.includes(item.id);
                      const willCostExtra = !active && selectedFrutas.length >= includedFrutas;
                      const thumb = getIngredientThumbnail('fruta', item);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleFruta(item.id)}
                          className={`relative rounded-2xl border-2 p-2.5 text-center transition-all cursor-pointer flex flex-col items-center active:scale-[0.97] ${
                            active
                              ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                              : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/60'
                          }`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                          <OptionPhoto
                            src={thumb}
                            alt={item.name}
                            className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2"
                          />
                          <div className="font-bold text-sm text-[#FFF4DC] leading-tight">
                            {item.name}
                          </div>
                          {willCostExtra ? (
                            <div className="text-[11px] text-[#F7B518] font-bold mt-0.5 tabular-nums">
                              + R$ {formatBRL(extraFrutaPrice)}
                            </div>
                          ) : (
                            <div className="text-[11px] text-[#3DDC84] font-semibold mt-0.5">
                              {active ? 'No copo' : 'Inclusa'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {stepIdx === 5 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#FFF4DC]/80">{graoStep.subtitle}</p>
                  {renderStepCounter(selectedGrao ? 1 : 0, 1, 0, true)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {graoStep.items
                    .filter((i) => i.available)
                    .map((item) => {
                      const active = selectedGrao === item.id;
                      const thumb = getIngredientThumbnail('grao', item);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedGrao(active ? null : item.id)}
                          className={`relative rounded-2xl border-2 p-2.5 text-center transition-all cursor-pointer flex flex-col items-center active:scale-[0.97] ${
                            active
                              ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                              : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/60'
                          }`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                          <OptionPhoto
                            src={thumb}
                            alt={item.name}
                            className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2"
                          />
                          <span className="font-bold text-sm text-[#FFF4DC] leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-[#3DDC84] font-semibold mt-0.5">
                            Incluso
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {stepIdx === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-[#FFF4DC]/80">{adicionaisStep.subtitle}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {adicionaisStep.items
                    .filter((i) => i.available)
                    .map((item) => {
                      const qty = extrasQty[item.id] || 0;
                      const thumb = getIngredientThumbnail('adicionais', item);
                      return (
                        <div
                          key={item.id}
                          className={`relative rounded-2xl border-2 p-2 transition-all flex flex-col justify-between ${
                            qty > 0
                              ? 'bg-[#5B1B72] border-[#F7B518] shadow-lg shadow-[#F7B518]/20'
                              : 'bg-[#451155]/85 border-[#62207A]/60 hover:border-[#F7B518]/50'
                          }`}
                        >
                          {qty > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#F7B518] text-[#2E0A3A] text-xs font-extrabold flex items-center justify-center shadow">
                              {qty}x
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => changeExtraQty(item.id, 1)}
                            className="w-full text-center cursor-pointer active:scale-[0.97] transition-transform"
                          >
                            <OptionPhoto
                              src={thumb}
                              alt={item.name}
                              className="w-full h-24 sm:h-28 object-cover rounded-xl mb-1.5"
                            />
                            <div className="font-bold text-xs text-[#FFF4DC] leading-tight line-clamp-2 min-h-[2rem] flex items-center justify-center">
                              {item.name}
                            </div>
                            <div className="text-xs font-extrabold text-[#F7B518] tabular-nums mt-0.5">
                              + R$ {formatBRL(item.price)}
                            </div>
                          </button>

                          <div className="mt-2 pt-1.5 border-t border-[#FFF4DC]/10 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => changeExtraQty(item.id, -1)}
                              disabled={qty === 0}
                              aria-label={`Remover ${item.name}`}
                              className="w-9 h-9 rounded-xl bg-[#2E0A3A] text-[#FFF4DC] disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs tabular-nums text-[#FFF4DC]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeExtraQty(item.id, 1)}
                              aria-label={`Adicionar ${item.name}`}
                              className="w-9 h-9 rounded-xl bg-[#F7B518] hover:bg-[#FFD45C] text-[#2E0A3A] flex items-center justify-center font-bold cursor-pointer active:scale-95 transition-transform"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {stepIdx === 7 && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 rounded-3xl bg-[#451155] border border-[#62207A] space-y-3">
                  <div className="flex items-center gap-2 text-[#F7B518] font-display font-bold text-lg">
                    <Sparkles className="w-5 h-5" />
                    Resumo da sua montagem
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#FFF4DC]/75">Tamanho</span>
                      <span className="font-bold">
                        {currentSize.name} (R$ {formatBRL(currentSize.price)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FFF4DC]/75">Acompanha</span>
                      <span className="font-semibold">Leite em pó</span>
                    </div>
                    {acaiObj && (
                      <div className="flex justify-between">
                        <span className="text-[#FFF4DC]/75">Açaí</span>
                        <span className="font-semibold">{acaiObj.name}</span>
                      </div>
                    )}
                    {cremeObj && (
                      <div className="flex justify-between">
                        <span className="text-[#FFF4DC]/75">Creme</span>
                        <span className="font-semibold">{cremeObj.name}</span>
                      </div>
                    )}
                    {caldaObjs.length > 0 && (
                      <div className="flex justify-between gap-4">
                        <span className="text-[#FFF4DC]/75">Calda(s)</span>
                        <span className="font-semibold text-right">
                          {caldaObjs.map((c) => c.name).join(', ')}
                          {extraCaldasCount > 0 &&
                            ` (+ R$ ${formatBRL(extraCaldasCount * extraCaldaPrice)})`}
                        </span>
                      </div>
                    )}
                    {frutaObjs.length > 0 && (
                      <div className="flex justify-between gap-4">
                        <span className="text-[#FFF4DC]/75">Fruta(s)</span>
                        <span className="font-semibold text-right">
                          {frutaObjs.map((f) => f.name).join(', ')}
                          {extraFrutasCount > 0 &&
                            ` (+ R$ ${formatBRL(extraFrutasCount * extraFrutaPrice)})`}
                        </span>
                      </div>
                    )}
                    {graoObj && (
                      <div className="flex justify-between">
                        <span className="text-[#FFF4DC]/75">Grão</span>
                        <span className="font-semibold">{graoObj.name}</span>
                      </div>
                    )}
                    {extraObjs.length > 0 && (
                      <div className="pt-2 border-t border-[#62207A]">
                        <span className="text-[#FFF4DC]/75 block mb-1">Adicionais:</span>
                        <div className="space-y-1">
                          {extraObjs.map(({ item, qty }) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span>
                                {qty}x {item.name}
                              </span>
                              <span className="text-[#F7B518] font-bold tabular-nums">
                                + R$ {formatBRL(item.price * qty)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#FFF4DC] mb-2">
                    Observações do item (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: mandar colher, caprichar no leite em pó, calda separada..."
                    className="w-full rounded-2xl bg-[#451155] border border-[#62207A] focus:border-[#F7B518] focus:outline-none px-4 py-3 text-sm text-[#FFF4DC] placeholder:text-[#FFF4DC]/40"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#451155]">
                  <span className="font-bold text-sm">Quantidade</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Diminuir quantidade"
                      className="w-11 h-11 rounded-xl bg-[#2E0A3A] text-[#FFF4DC] flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-display text-lg font-bold w-6 text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Aumentar quantidade"
                      className="w-11 h-11 rounded-xl bg-[#F7B518] text-[#2E0A3A] flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-[#62207A] bg-[#3B0F4A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                className="min-h-[46px] px-3.5 rounded-xl bg-[#2E0A3A] hover:bg-[#4A1259] border border-[#62207A] text-[#FFF4DC] font-bold text-sm flex items-center gap-1 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            {/* Quick size switcher matching studio layout */}
            <div className="relative hidden md:block">
              <label htmlFor="quick-size-select" className="sr-only">
                Tamanho selecionado
              </label>
              <select
                id="quick-size-select"
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(e.target.value)}
                className="appearance-none min-h-[46px] pl-3.5 pr-8 rounded-xl bg-[#2E0A3A] border border-[#62207A] hover:border-[#F7B518]/60 text-xs font-bold text-[#FFF4DC] cursor-pointer focus:outline-none focus:border-[#F7B518]"
              >
                {allSizes.map((sz) => (
                  <option key={sz.id} value={sz.id} className="bg-[#2E0A3A] text-[#FFF4DC]">
                    {sz.name} · R$ {formatBRL(sz.price)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#F7B518] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div>
              <div className="text-[11px] text-[#FFF4DC]/70">Total do item</div>
              <AnimatedPrice value={unitPrice * quantity} />
            </div>
          </div>

          {stepIdx < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIdx((i) => Math.min(STEP_LABELS.length - 1, i + 1))}
              className="min-h-[48px] px-6 rounded-2xl bg-[#F7B518] hover:bg-[#FFD45C] text-[#2E0A3A] font-display font-extrabold text-base flex items-center gap-2 shadow-lg shadow-[#F7B518]/25 transition-transform active:scale-95 cursor-pointer"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="min-h-[48px] px-6 rounded-2xl bg-[#F7B518] hover:bg-[#FFD45C] text-[#2E0A3A] font-display font-extrabold text-base flex items-center gap-2 shadow-lg shadow-[#F7B518]/30 transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Adicionar ao carrinho
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

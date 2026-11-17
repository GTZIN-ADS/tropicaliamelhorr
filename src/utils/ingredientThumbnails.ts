import { BuilderOptionItem, BuilderSize } from '../types';
import gridAcaiCremes from '../assets/images/acai_bases_cremes_1794790042760.jpg';
import gridCaldas from '../assets/images/caldas_syrups_grid_1794790043385.jpg';
import gridFrutasGraos from '../assets/images/frutas_graos_grid_1794790044538.jpg';
import gridExtrasChoco from '../assets/images/extras_choco_grid_1794790046056.jpg';
import gridExtrasNuts from '../assets/images/extras_nuts_powders_1794790048366.jpg';
import gridExtrasMore from '../assets/images/extras_candies_more_1794790049219.jpg';
import sheetCutoutsFruitsGrains from '../assets/images/cutouts_fruits_grains_3d_1794791057863.jpg';
import sheetCutoutsChocoCandies from '../assets/images/cutouts_choco_candies_3d_1794791059732.jpg';
import sheetCutoutsNutsCreams from '../assets/images/cutouts_nuts_creams_3d_1794791061485.jpg';
import sheetCutoutsSyrupsFinishes from '../assets/images/cutouts_syrups_finishes_3d_1794791062384.jpg';
import sheetCutoutsSingleFruits from '../assets/images/cutouts_single_fruits_3d_1794792973978.jpg';
import realCupTopdownBasePhoto from '../assets/images/real_acai_cup_topdown_v2_1794944558822.jpg';
import realBowlTopdownBasePhoto from '../assets/images/real_acai_bowl_topdown_base_1794794047517.jpg';
import sheetMilkShakesExtras from '../assets/images/menu_milkshakes_grid_1794829841143.jpg';
import sheetDrinksExtras from '../assets/images/menu_drinks_extras_grid_1794829843031.jpg';
import sheetBebidasExtras2 from '../assets/images/menu_bebidas_adicionais2_grid_1794829846935.jpg';

export const REAL_CUP_BASE_PHOTO = realCupTopdownBasePhoto;
export const REAL_BOWL_BASE_PHOTO = realBowlTopdownBasePhoto;

interface GridCellSpec {
  sheet: string;
  col: number;
  row: number;
  strictPurpleGuard?: boolean;
  splitPieces?: boolean;
  maxSprites?: number;
}

/**
 * Studio card thumbnail photos (rendered in option selection grid).
 */
const CARD_THUMB_MAP: Record<string, GridCellSpec> = {
  // Etapa 2: Acai
  'acai-puro': { sheet: gridAcaiCremes, col: 0, row: 0 },
  'acai-morango': { sheet: gridAcaiCremes, col: 1, row: 0 },
  'acai-banana': { sheet: gridAcaiCremes, col: 2, row: 0 },

  // Etapa 3: Creme
  'creme-cupuacu': { sheet: gridAcaiCremes, col: 0, row: 1 },
  'creme-ninho': { sheet: gridAcaiCremes, col: 1, row: 1 },
  'creme-ninho-nutella': { sheet: gridAcaiCremes, col: 2, row: 1 },

  // Etapa 4: Caldas
  'calda-leite-condensado': { sheet: gridAcaiCremes, col: 0, row: 2 },
  'calda-mel-engenho': { sheet: gridAcaiCremes, col: 1, row: 2 },
  'calda-morango': { sheet: gridAcaiCremes, col: 2, row: 2 },
  'calda-frutas-vermelhas': { sheet: gridCaldas, col: 0, row: 0 },
  'calda-chocolate': { sheet: gridCaldas, col: 1, row: 0 },
  'calda-doce-de-leite': { sheet: sheetBebidasExtras2, col: 0, row: 2 },
  'calda-caramelo': { sheet: gridCaldas, col: 0, row: 1 },
  'calda-maracuja': { sheet: gridCaldas, col: 1, row: 1 },
  'calda-limao': { sheet: gridCaldas, col: 2, row: 1 },
  'calda-menta': { sheet: sheetBebidasExtras2, col: 2, row: 2 },
  'calda-kiwi': { sheet: gridCaldas, col: 1, row: 2 },
  'calda-acai': { sheet: gridCaldas, col: 2, row: 2 },
  'calda-uva': { sheet: sheetBebidasExtras2, col: 1, row: 2 },
  'calda-amora': { sheet: gridFrutasGraos, col: 1, row: 0 },

  // Etapa 5: Frutas
  'fruta-banana': { sheet: gridFrutasGraos, col: 2, row: 0 },
  'fruta-morango': { sheet: gridFrutasGraos, col: 0, row: 1 },
  'fruta-kiwi': { sheet: gridFrutasGraos, col: 1, row: 1 },
  'fruta-uva': { sheet: gridFrutasGraos, col: 2, row: 1 },
  'fruta-maca': { sheet: gridFrutasGraos, col: 0, row: 2 },

  // Etapa 6: Graos
  'grao-granola': { sheet: gridFrutasGraos, col: 1, row: 2 },
  'grao-sucrilhos': { sheet: gridFrutasGraos, col: 2, row: 2 },
  'grao-cereal-choc': { sheet: gridExtrasChoco, col: 0, row: 0 },

  // Etapa 7: Adicionais
  'ext-amendoim': { sheet: gridExtrasNuts, col: 0, row: 0 },
  'ext-amendoim-granulado': { sheet: sheetDrinksExtras, col: 2, row: 1 },
  'ext-bananinha-fini': { sheet: gridExtrasMore, col: 0, row: 1 },
  'ext-batom-garoto': { sheet: sheetDrinksExtras, col: 0, row: 2 },
  'ext-bis': { sheet: gridExtrasChoco, col: 1, row: 1 },
  'ext-bolinhas-crocantes': { sheet: gridExtrasMore, col: 2, row: 0 },
  'ext-bombom': { sheet: gridExtrasMore, col: 0, row: 0 },
  'ext-canudinho': { sheet: gridExtrasNuts, col: 2, row: 1 },
  'ext-castanha': { sheet: gridExtrasNuts, col: 2, row: 0 },
  'ext-cereal-choc': { sheet: gridExtrasChoco, col: 0, row: 0 },
  'ext-creme-ovomaltine': { sheet: sheetBebidasExtras2, col: 0, row: 1 },
  'ext-creme-pistache': { sheet: gridExtrasNuts, col: 2, row: 2 },
  'ext-dentadura-fini': { sheet: gridExtrasMore, col: 1, row: 1 },
  'ext-farinha-amendoim': { sheet: sheetBebidasExtras2, col: 1, row: 0 },
  'ext-farinha-pacoca': { sheet: gridExtrasNuts, col: 1, row: 0 },
  'ext-farinha-lactea': { sheet: sheetBebidasExtras2, col: 2, row: 0 },
  'ext-flocos-arroz': { sheet: sheetBebidasExtras2, col: 1, row: 1 },
  'ext-gotas-oreo': { sheet: sheetBebidasExtras2, col: 2, row: 1 },
  'ext-gotas-choc': { sheet: gridExtrasChoco, col: 0, row: 2 },
  'ext-gotas-choc-branco': { sheet: gridExtrasChoco, col: 1, row: 2 },
  'ext-granola': { sheet: gridFrutasGraos, col: 1, row: 2 },
  'ext-jujuba': { sheet: gridExtrasNuts, col: 1, row: 2 },
  'ext-jujuba-acida': { sheet: sheetDrinksExtras, col: 1, row: 2 },
  'ext-kit-kat': { sheet: gridExtrasChoco, col: 0, row: 1 },
  'ext-leite-po': { sheet: gridExtrasNuts, col: 0, row: 1 },
  'ext-leite-po-ninho': { sheet: gridExtrasNuts, col: 1, row: 1 },
  'ext-mms': { sheet: gridExtrasChoco, col: 1, row: 0 },
  'ext-marshmallow': { sheet: gridExtrasNuts, col: 0, row: 2 },
  'ext-mini-oreo': { sheet: gridExtrasMore, col: 2, row: 1 },
  'ext-mini-disquete': { sheet: sheetDrinksExtras, col: 2, row: 2 },
  'ext-negresco-triturado': { sheet: gridExtrasMore, col: 0, row: 2 },
  'ext-neston': { sheet: gridExtrasMore, col: 1, row: 2 },
  'ext-nutella': { sheet: gridExtrasChoco, col: 2, row: 0 },
  'ext-ovomaltine': { sheet: gridExtrasChoco, col: 2, row: 2 },
  'ext-ovomaltine-rocks': { sheet: sheetMilkShakesExtras, col: 2, row: 2 },
  'ext-pasta-amendoim': { sheet: gridExtrasMore, col: 2, row: 2 },
  'ext-sucrilhos': { sheet: gridFrutasGraos, col: 2, row: 2 },
};

/**
 * Multi-sprite definitions: maps each ingredient to one or more isolated 3D cells.
 * Cells with `splitPieces: true` are automatically separated via connected-component analysis
 * into individual realistic flakes/crumbs/berries/candies!
 */
const FLOATING_3D_SPRITES_MAP: Record<string, GridCellSpec[]> = {
  // Etapa 2: Acai
  'acai-puro': [{ sheet: sheetCutoutsSyrupsFinishes, col: 0, row: 2, strictPurpleGuard: true }],
  'acai-morango': [{ sheet: sheetCutoutsSingleFruits, col: 1, row: 0 }],
  'acai-banana': [{ sheet: sheetCutoutsSingleFruits, col: 0, row: 2 }],

  // Etapa 3: Creme
  'creme-cupuacu': [{ sheet: sheetCutoutsNutsCreams, col: 2, row: 2 }],
  'creme-ninho': [{ sheet: sheetCutoutsNutsCreams, col: 1, row: 1 }],
  'creme-ninho-nutella': [{ sheet: sheetCutoutsNutsCreams, col: 2, row: 1 }],

  // Etapa 4: Caldas
  'calda-leite-condensado': [{ sheet: sheetCutoutsSyrupsFinishes, col: 0, row: 0 }],
  'calda-mel-engenho': [{ sheet: sheetCutoutsSyrupsFinishes, col: 1, row: 0 }],
  'calda-morango': [{ sheet: sheetCutoutsSyrupsFinishes, col: 2, row: 0 }],
  'calda-frutas-vermelhas': [{ sheet: sheetCutoutsSyrupsFinishes, col: 2, row: 0 }],
  'calda-chocolate': [{ sheet: sheetCutoutsSyrupsFinishes, col: 0, row: 1 }],
  'calda-doce-de-leite': [{ sheet: sheetCutoutsSyrupsFinishes, col: 1, row: 0 }],
  'calda-caramelo': [{ sheet: sheetCutoutsSyrupsFinishes, col: 1, row: 0 }],
  'calda-maracuja': [{ sheet: sheetCutoutsSyrupsFinishes, col: 1, row: 1 }],
  'calda-limao': [{ sheet: sheetCutoutsSyrupsFinishes, col: 2, row: 1 }],
  'calda-menta': [{ sheet: sheetCutoutsSyrupsFinishes, col: 2, row: 1 }],
  'calda-kiwi': [{ sheet: sheetCutoutsSyrupsFinishes, col: 2, row: 1 }],
  'calda-acai': [{ sheet: sheetCutoutsSyrupsFinishes, col: 0, row: 2, strictPurpleGuard: true }],
  'calda-uva': [{ sheet: sheetCutoutsSyrupsFinishes, col: 0, row: 2, strictPurpleGuard: true }],
  'calda-amora': [{ sheet: sheetCutoutsSyrupsFinishes, col: 0, row: 2, strictPurpleGuard: true }],

  // Etapa 5: Frutas (individual single-piece photos!)
  'fruta-morango': [
    { sheet: sheetCutoutsSingleFruits, col: 1, row: 0 },
    { sheet: sheetCutoutsSingleFruits, col: 2, row: 1 },
    { sheet: sheetCutoutsSingleFruits, col: 2, row: 2 },
  ],
  'fruta-banana': [
    { sheet: sheetCutoutsSingleFruits, col: 0, row: 2 },
    { sheet: sheetCutoutsSingleFruits, col: 0, row: 0 },
  ],
  'fruta-kiwi': [{ sheet: sheetCutoutsSingleFruits, col: 2, row: 0 }],
  'fruta-uva': [
    { sheet: sheetCutoutsSingleFruits, col: 0, row: 1, strictPurpleGuard: true },
    { sheet: sheetCutoutsSingleFruits, col: 1, row: 1 },
  ],
  'fruta-maca': [{ sheet: sheetCutoutsSingleFruits, col: 1, row: 2 }],

  // Etapa 6: Graos (split into distinct individual clusters & flakes!)
  'grao-granola': [
    { sheet: sheetCutoutsFruitsGrains, col: 2, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'grao-sucrilhos': [
    { sheet: sheetCutoutsFruitsGrains, col: 0, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'grao-cereal-choc': [
    { sheet: sheetCutoutsFruitsGrains, col: 1, row: 2, splitPieces: true, maxSprites: 8 },
  ],

  // Etapa 7: Adicionais
  'ext-amendoim': [
    { sheet: sheetCutoutsNutsCreams, col: 0, row: 0, splitPieces: true, maxSprites: 8 },
  ],
  'ext-amendoim-granulado': [
    { sheet: sheetCutoutsNutsCreams, col: 0, row: 0, splitPieces: true, maxSprites: 8 },
  ],
  'ext-bananinha-fini': [
    { sheet: sheetCutoutsSyrupsFinishes, col: 1, row: 2, splitPieces: true, maxSprites: 5 },
  ],
  'ext-batom-garoto': [
    { sheet: sheetCutoutsChocoCandies, col: 1, row: 0, splitPieces: true, maxSprites: 5 },
  ],
  'ext-bis': [
    { sheet: sheetCutoutsChocoCandies, col: 1, row: 0, splitPieces: true, maxSprites: 5 },
  ],
  'ext-bolinhas-crocantes': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'ext-bombom': [
    { sheet: sheetCutoutsChocoCandies, col: 1, row: 1, splitPieces: true, maxSprites: 6 },
  ],
  'ext-canudinho': [{ sheet: sheetCutoutsNutsCreams, col: 0, row: 1 }],
  'ext-castanha': [
    { sheet: sheetCutoutsNutsCreams, col: 1, row: 0, splitPieces: true, maxSprites: 5 },
  ],
  'ext-cereal-choc': [
    { sheet: sheetCutoutsFruitsGrains, col: 1, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-creme-ovomaltine': [{ sheet: sheetCutoutsNutsCreams, col: 2, row: 1 }],
  'ext-creme-pistache': [{ sheet: sheetCutoutsNutsCreams, col: 0, row: 2 }],
  'ext-dentadura-fini': [
    { sheet: sheetCutoutsSyrupsFinishes, col: 2, row: 2, splitPieces: true, maxSprites: 6 },
  ],
  'ext-farinha-amendoim': [
    { sheet: sheetCutoutsNutsCreams, col: 2, row: 0, splitPieces: true, maxSprites: 8 },
  ],
  'ext-farinha-pacoca': [
    { sheet: sheetCutoutsNutsCreams, col: 2, row: 0, splitPieces: true, maxSprites: 8 },
  ],
  'ext-farinha-lactea': [{ sheet: sheetCutoutsNutsCreams, col: 1, row: 1 }],
  'ext-flocos-arroz': [
    { sheet: sheetCutoutsFruitsGrains, col: 2, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-gotas-oreo': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 0, splitPieces: true, maxSprites: 6 },
  ],
  'ext-gotas-choc': [
    { sheet: sheetCutoutsChocoCandies, col: 1, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'ext-gotas-choc-branco': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'ext-granola': [
    { sheet: sheetCutoutsFruitsGrains, col: 2, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'ext-jujuba': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-jujuba-acida': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-kit-kat': [
    { sheet: sheetCutoutsChocoCandies, col: 0, row: 0, splitPieces: true, maxSprites: 5 },
  ],
  'ext-leite-po': [{ sheet: sheetCutoutsNutsCreams, col: 1, row: 1 }],
  'ext-leite-po-ninho': [{ sheet: sheetCutoutsNutsCreams, col: 1, row: 1 }],
  'ext-mms': [
    { sheet: sheetCutoutsChocoCandies, col: 0, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'ext-marshmallow': [
    { sheet: sheetCutoutsChocoCandies, col: 1, row: 2, splitPieces: true, maxSprites: 5 },
  ],
  'ext-mini-oreo': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 0, splitPieces: true, maxSprites: 6 },
  ],
  'ext-mini-disquete': [
    { sheet: sheetCutoutsChocoCandies, col: 0, row: 1, splitPieces: true, maxSprites: 8 },
  ],
  'ext-negresco-triturado': [
    { sheet: sheetCutoutsChocoCandies, col: 2, row: 0, splitPieces: true, maxSprites: 6 },
  ],
  'ext-neston': [
    { sheet: sheetCutoutsFruitsGrains, col: 2, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-nutella': [{ sheet: sheetCutoutsNutsCreams, col: 2, row: 1 }],
  'ext-ovomaltine': [
    { sheet: sheetCutoutsChocoCandies, col: 0, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-ovomaltine-rocks': [
    { sheet: sheetCutoutsChocoCandies, col: 0, row: 2, splitPieces: true, maxSprites: 8 },
  ],
  'ext-pasta-amendoim': [{ sheet: sheetCutoutsNutsCreams, col: 1, row: 2 }],
  'ext-sucrilhos': [
    { sheet: sheetCutoutsFruitsGrains, col: 0, row: 2, splitPieces: true, maxSprites: 8 },
  ],
};

const CARD_SHEETS = [
  gridAcaiCremes,
  gridCaldas,
  gridFrutasGraos,
  gridExtrasChoco,
  gridExtrasNuts,
  gridExtrasMore,
  sheetMilkShakesExtras,
  sheetDrinksExtras,
  sheetBebidasExtras2,
];

const CUTOUT_SHEETS = [
  sheetCutoutsSingleFruits,
  sheetCutoutsFruitsGrains,
  sheetCutoutsChocoCandies,
  sheetCutoutsNutsCreams,
  sheetCutoutsSyrupsFinishes,
];

const slicedCellCache = new Map<string, string>();
const cutoutCellCache = new Map<string, string>();
const splitSpritesCache = new Map<string, string[]>();
let preloadPromise: Promise<void> | null = null;

function resolveCardSpec(
  stepId: string,
  item: Pick<BuilderOptionItem, 'id' | 'name'>
): GridCellSpec {
  const exact = CARD_THUMB_MAP[item.id];
  if (exact) return exact;
  return resolveFallbackSpec(CARD_THUMB_MAP, stepId, item);
}

function resolveSpriteSpecs(
  stepId: string,
  item: Pick<BuilderOptionItem, 'id' | 'name'>
): GridCellSpec[] {
  const exact = FLOATING_3D_SPRITES_MAP[item.id];
  if (exact) return exact;

  const text = `${item.id} ${item.name}`.toLowerCase();
  if (text.includes('leite condensado')) return FLOATING_3D_SPRITES_MAP['calda-leite-condensado'];
  if (text.includes('mel')) return FLOATING_3D_SPRITES_MAP['calda-mel-engenho'];
  if (text.includes('morango') && stepId === 'calda') return FLOATING_3D_SPRITES_MAP['calda-morango'];
  if (text.includes('frutas vermelhas')) return FLOATING_3D_SPRITES_MAP['calda-frutas-vermelhas'];
  if (text.includes('doce de leite')) return FLOATING_3D_SPRITES_MAP['calda-doce-de-leite'];
  if (text.includes('caramelo')) return FLOATING_3D_SPRITES_MAP['calda-caramelo'];
  if (text.includes('maracuj')) return FLOATING_3D_SPRITES_MAP['calda-maracuja'];
  if (text.includes('lim')) return FLOATING_3D_SPRITES_MAP['calda-limao'];
  if (text.includes('menta')) return FLOATING_3D_SPRITES_MAP['calda-menta'];
  if (text.includes('kiwi') && stepId === 'calda') return FLOATING_3D_SPRITES_MAP['calda-kiwi'];
  if (text.includes('uva') && stepId === 'calda') return FLOATING_3D_SPRITES_MAP['calda-uva'];
  if (text.includes('amora')) return FLOATING_3D_SPRITES_MAP['calda-amora'];
  if (text.includes('morango')) return FLOATING_3D_SPRITES_MAP['fruta-morango'];
  if (text.includes('banana') && !text.includes('fini')) return FLOATING_3D_SPRITES_MAP['fruta-banana'];
  if (text.includes('kiwi')) return FLOATING_3D_SPRITES_MAP['fruta-kiwi'];
  if (text.includes('uva')) return FLOATING_3D_SPRITES_MAP['fruta-uva'];
  if (text.includes('maç') || text.includes('maca')) return FLOATING_3D_SPRITES_MAP['fruta-maca'];
  if (text.includes('granola')) return FLOATING_3D_SPRITES_MAP['grao-granola'];
  if (text.includes('sucrilhos')) return FLOATING_3D_SPRITES_MAP['grao-sucrilhos'];
  if (text.includes('nutella')) return FLOATING_3D_SPRITES_MAP['ext-nutella'];
  if (text.includes('pistache')) return FLOATING_3D_SPRITES_MAP['ext-creme-pistache'];
  if (text.includes('ninho')) return FLOATING_3D_SPRITES_MAP['ext-leite-po-ninho'];
  if (text.includes('leite')) return FLOATING_3D_SPRITES_MAP['ext-leite-po'];
  if (text.includes('paçoca') || text.includes('pacoca')) return FLOATING_3D_SPRITES_MAP['ext-farinha-pacoca'];
  if (text.includes('chocolate') && stepId === 'calda') return FLOATING_3D_SPRITES_MAP['calda-chocolate'];
  if (text.includes('chocolate')) return FLOATING_3D_SPRITES_MAP['ext-gotas-choc'];
  if (text.includes('oreo')) return FLOATING_3D_SPRITES_MAP['ext-mini-oreo'];
  if (text.includes('kit kat')) return FLOATING_3D_SPRITES_MAP['ext-kit-kat'];
  if (text.includes('m&m') || text.includes('disquete')) return FLOATING_3D_SPRITES_MAP['ext-mms'];
  if (stepId === 'creme') return FLOATING_3D_SPRITES_MAP['creme-cupuacu'];
  if (stepId === 'calda') return FLOATING_3D_SPRITES_MAP['calda-acai'];
  if (stepId === 'acai') return FLOATING_3D_SPRITES_MAP['acai-puro'];
  return FLOATING_3D_SPRITES_MAP['ext-bolinhas-crocantes'];
}

function resolveFallbackSpec(
  map: Record<string, GridCellSpec>,
  stepId: string,
  item: Pick<BuilderOptionItem, 'id' | 'name'>
): GridCellSpec {
  const text = `${item.id} ${item.name}`.toLowerCase();
  if (text.includes('leite condensado')) return map['calda-leite-condensado'];
  if (text.includes('mel')) return map['calda-mel-engenho'];
  if (text.includes('morango') && stepId === 'calda') return map['calda-morango'];
  if (text.includes('frutas vermelhas')) return map['calda-frutas-vermelhas'];
  if (text.includes('doce de leite')) return map['calda-doce-de-leite'];
  if (text.includes('caramelo')) return map['calda-caramelo'];
  if (text.includes('maracuj')) return map['calda-maracuja'];
  if (text.includes('lim')) return map['calda-limao'];
  if (text.includes('menta')) return map['calda-menta'];
  if (text.includes('kiwi') && stepId === 'calda') return map['calda-kiwi'];
  if (text.includes('uva') && stepId === 'calda') return map['calda-uva'];
  if (text.includes('amora')) return map['calda-amora'];
  if (text.includes('morango')) return map['fruta-morango'];
  if (text.includes('banana') && !text.includes('fini')) return map['fruta-banana'];
  if (text.includes('kiwi')) return map['fruta-kiwi'];
  if (text.includes('uva')) return map['fruta-uva'];
  if (text.includes('maç') || text.includes('maca')) return map['fruta-maca'];
  if (text.includes('granola')) return map['grao-granola'];
  if (text.includes('sucrilhos')) return map['grao-sucrilhos'];
  if (text.includes('nutella')) return map['ext-nutella'];
  if (text.includes('pistache')) return map['ext-creme-pistache'];
  if (text.includes('ninho')) return map['ext-leite-po-ninho'];
  if (text.includes('leite')) return map['ext-leite-po'];
  if (text.includes('paçoca') || text.includes('pacoca')) return map['ext-farinha-pacoca'];
  if (text.includes('chocolate') && stepId === 'calda') return map['calda-chocolate'];
  if (text.includes('chocolate')) return map['ext-gotas-choc'];
  if (text.includes('oreo')) return map['ext-mini-oreo'];
  if (text.includes('kit kat')) return map['ext-kit-kat'];
  if (text.includes('m&m') || text.includes('disquete')) return map['ext-mms'];
  if (stepId === 'creme') return map['creme-cupuacu'];
  if (stepId === 'calda') return map['calda-acai'];
  if (stepId === 'acai') return map['acai-puro'];
  return map['ext-bolinhas-crocantes'];
}

function clearStudioBackgroundInPlace(
  ctx: CanvasRenderingContext2D,
  size: number,
  strictPurpleGuard: boolean
): ImageData {
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;
  const corners = [
    [2, 2],
    [size - 7, 2],
    [2, size - 7],
    [size - 7, size - 7],
  ];
  for (const [cx, cy] of corners) {
    for (let dy = 0; dy < 5; dy += 1) {
      for (let dx = 0; dx < 5; dx += 1) {
        const p = ((cy + dy) * size + (cx + dx)) * 4;
        sumR += data[p];
        sumG += data[p + 1];
        sumB += data[p + 2];
        count += 1;
      }
    }
  }
  const bgR = sumR / count;
  const bgG = sumG / count;
  const bgB = sumB / count;

  const maxDist = strictPurpleGuard ? 36 : 56;
  const visited = new Uint8Array(size * size);
  const queue = new Int32Array(size * size);
  let head = 0;
  let tail = 0;

  const isBgPixel = (idx: number): boolean => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    const isPurpleTone = b > g + 6 && r > g + 2;
    return dist < maxDist && (isPurpleTone || dist < 24);
  };

  const enqueue = (idx: number) => {
    if (visited[idx]) return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < size; x += 1) {
    enqueue(x);
    enqueue((size - 1) * size + x);
  }
  for (let y = 1; y < size - 1; y += 1) {
    enqueue(y * size);
    enqueue(y * size + (size - 1));
  }

  while (head < tail) {
    const idx = queue[head++];
    if (!isBgPixel(idx)) continue;
    data[idx * 4 + 3] = 0;
    const x = idx % size;
    const y = (idx / size) | 0;
    if (x > 0) enqueue(idx - 1);
    if (x < size - 1) enqueue(idx + 1);
    if (y > 0) enqueue(idx - size);
    if (y < size - 1) enqueue(idx + size);
  }

  // Smooth edge feathering + purple edge despill
  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      const idx = y * size + x;
      const p = idx * 4;
      if (data[p + 3] === 0) continue;

      let transparentNeighbors = 0;
      if (data[(idx - 1) * 4 + 3] === 0) transparentNeighbors += 1;
      if (data[(idx + 1) * 4 + 3] === 0) transparentNeighbors += 1;
      if (data[(idx - size) * 4 + 3] === 0) transparentNeighbors += 1;
      if (data[(idx + size) * 4 + 3] === 0) transparentNeighbors += 1;

      if (transparentNeighbors > 0) {
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const dr = r - bgR;
        const dg = g - bgG;
        const db = b - bgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < maxDist + 18 && b > g + 4) {
          data[p + 3] = transparentNeighbors >= 2 ? 75 : 155;
          data[p + 2] = Math.min(b, Math.round((r + g) * 0.5));
        } else {
          data[p + 3] = transparentNeighbors >= 2 ? 170 : 225;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return imgData;
}

function cropBoundingBoxToPng(
  srcCanvas: HTMLCanvasElement,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  outSize = 180
): string {
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const boxSide = Math.max(bw, bh);
  const targetMax = outSize * 0.88;
  const scale = targetMax / boxSide;
  const drawW = bw * scale;
  const drawH = bh * scale;
  const dx = (outSize - drawW) / 2;
  const dy = (outSize - drawH) / 2;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outSize;
  outCanvas.height = outSize;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return srcCanvas.toDataURL('image/png');
  outCtx.drawImage(srcCanvas, minX, minY, bw, bh, dx, dy, drawW, drawH);
  return outCanvas.toDataURL('image/png');
}

function extractSingleCutout(
  ctx: CanvasRenderingContext2D,
  imgData: ImageData,
  size: number
): string {
  const data = imgData.data;
  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (data[(y * size + x) * 4 + 3] > 28) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return ctx.canvas.toDataURL('image/png');
  }
  return cropBoundingBoxToPng(ctx.canvas, minX, minY, maxX, maxY, 200);
}

/**
 * Splits a multi-piece cutout cell (granola, cornflakes, pacoca, M&Ms, choco chips, peanuts)
 * into individual transparent PNG sprites using 8-neighbor connected components!
 */
function extractIndividualSprites(
  ctx: CanvasRenderingContext2D,
  imgData: ImageData,
  size: number,
  maxSprites = 8
): string[] {
  const data = imgData.data;
  const compId = new Int32Array(size * size);
  const queue = new Int32Array(size * size);

  interface CompBox {
    id: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    area: number;
  }
  const components: CompBox[] = [];
  let nextId = 1;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const startIdx = y * size + x;
      if (compId[startIdx] !== 0 || data[startIdx * 4 + 3] <= 32) continue;

      const id = nextId++;
      let head = 0;
      let tail = 0;
      compId[startIdx] = id;
      queue[tail++] = startIdx;

      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let area = 0;

      while (head < tail) {
        const idx = queue[head++];
        area += 1;
        const cx = idx % size;
        const cy = (idx / size) | 0;
        if (cx < minX) minX = cx;
        if (cy < minY) minY = cy;
        if (cx > maxX) maxX = cx;
        if (cy > maxY) maxY = cy;

        for (let dy = -1; dy <= 1; dy += 1) {
          const ny = cy + dy;
          if (ny < 0 || ny >= size) continue;
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            if (nx < 0 || nx >= size) continue;
            const nIdx = ny * size + nx;
            if (compId[nIdx] === 0 && data[nIdx * 4 + 3] > 32) {
              compId[nIdx] = id;
              queue[tail++] = nIdx;
            }
          }
        }
      }

      if (area >= 42) {
        components.push({ id, minX, minY, maxX, maxY, area });
      }
    }
  }

  if (components.length === 0) {
    return [extractSingleCutout(ctx, imgData, size)];
  }

  // Keep distinct sized pieces (not just tiny specks) sorted largest-first
  components.sort((a, b) => b.area - a.area);
  const picked = components.slice(0, maxSprites);

  const pieceCanvas = document.createElement('canvas');
  pieceCanvas.width = size;
  pieceCanvas.height = size;
  const pieceCtx = pieceCanvas.getContext('2d');
  if (!pieceCtx) return [extractSingleCutout(ctx, imgData, size)];

  const sprites: string[] = [];
  for (const comp of picked) {
    const outImg = pieceCtx.createImageData(size, size);
    const outData = outImg.data;
    for (let y = comp.minY; y <= comp.maxY; y += 1) {
      for (let x = comp.minX; x <= comp.maxX; x += 1) {
        const idx = y * size + x;
        if (compId[idx] === comp.id) {
          const p = idx * 4;
          outData[p] = data[p];
          outData[p + 1] = data[p + 1];
          outData[p + 2] = data[p + 2];
          outData[p + 3] = data[p + 3];
        }
      }
    }
    pieceCtx.putImageData(outImg, 0, 0);
    sprites.push(cropBoundingBoxToPng(pieceCanvas, comp.minX, comp.minY, comp.maxX, comp.maxY, 150));
  }

  return sprites;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function canvasToBlobUrl(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(canvas.toDataURL(mimeType, quality));
          }
        },
        mimeType,
        quality
      );
    } else {
      resolve(canvas.toDataURL(mimeType, quality));
    }
  });
}

function sliceCardSheet(sheetUrl: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const cellW = img.naturalWidth / 3;
      const cellH = img.naturalHeight / 3;
      const padX = cellW * 0.045;
      const padY = cellH * 0.045;
      const srcW = cellW - padX * 2;
      const srcH = cellH - padY * 2;
      const outSize = 260;

      const canvas = document.createElement('canvas');
      canvas.width = outSize;
      canvas.height = outSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          ctx.clearRect(0, 0, outSize, outSize);
          ctx.drawImage(
            img,
            col * cellW + padX,
            row * cellH + padY,
            srcW,
            srcH,
            0,
            0,
            outSize,
            outSize
          );
          const url = await canvasToBlobUrl(canvas, 'image/jpeg', 0.88);
          slicedCellCache.set(`${sheetUrl}:${col}:${row}`, url);
        }
      }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = sheetUrl;
  });
}

function sliceCutoutSheet(sheetUrl: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const cellW = img.naturalWidth / 3;
      const cellH = img.naturalHeight / 3;
      const padX = cellW * 0.055;
      const padY = cellH * 0.055;
      const srcW = cellW - padX * 2;
      const srcH = cellH - padY * 2;
      const workSize = 280;

      const canvas = document.createElement('canvas');
      canvas.width = workSize;
      canvas.height = workSize;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve();
        return;
      }

      // Build map of which cells require multi-piece sprite splitting
      const splitFlags = new Map<string, number>();
      Object.values(FLOATING_3D_SPRITES_MAP).forEach((specs) => {
        specs.forEach((s) => {
          if (s.sheet === sheetUrl && s.splitPieces) {
            const k = `${s.col}:${s.row}`;
            splitFlags.set(k, Math.max(splitFlags.get(k) || 0, s.maxSprites || 8));
          }
        });
      });

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const isStrictPurpleCell =
            (sheetUrl === sheetCutoutsSyrupsFinishes && col === 0 && row === 2) ||
            (sheetUrl === sheetCutoutsSingleFruits && col === 0 && row === 1);

          ctx.clearRect(0, 0, workSize, workSize);
          ctx.drawImage(
            img,
            col * cellW + padX,
            row * cellH + padY,
            srcW,
            srcH,
            0,
            0,
            workSize,
            workSize
          );

          const cleanImgData = clearStudioBackgroundInPlace(ctx, workSize, isStrictPurpleCell);
          const key = `${sheetUrl}:${col}:${row}`;
          cutoutCellCache.set(key, extractSingleCutout(ctx, cleanImgData, workSize));

          const maxPieces = splitFlags.get(`${col}:${row}`);
          if (maxPieces) {
            splitSpritesCache.set(key, extractIndividualSprites(ctx, cleanImgData, workSize, maxPieces));
          }
          await yieldToBrowser();
        }
      }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = sheetUrl;
  });
}

export function preloadBuilderRealPhotos(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = (async () => {
      // Load card thumbnails first so builder options paint immediately
      await Promise.all(CARD_SHEETS.map(sliceCardSheet));
      // Process cutout sheets sequentially with frame yields so UI stays 60fps
      for (const sheet of CUTOUT_SHEETS) {
        await sliceCutoutSheet(sheet);
      }
    })();
  }
  return preloadPromise;
}

export function getIngredientThumbnail(
  stepId: string,
  item: Pick<BuilderOptionItem, 'id' | 'name' | 'color' | 'imageUrl'>
): string {
  if (item.imageUrl && item.imageUrl.trim().length > 0) {
    return item.imageUrl;
  }
  const spec = resolveCardSpec(stepId, item);
  return slicedCellCache.get(`${spec.sheet}:${spec.col}:${spec.row}`) || '';
}

/**
 * Returns an array of individual photorealistic transparent 3D sprite URLs for falling & landing.
 * For granola, cornflakes, M&Ms, choco chips, pacoca, fruits, etc., returns multiple distinct piece sprites!
 */
export function getIngredientSprites(
  stepId: string,
  item: Pick<BuilderOptionItem, 'id' | 'name' | 'color' | 'imageUrl'>
): string[] {
  if (item.imageUrl && item.imageUrl.trim().length > 0) {
    return [item.imageUrl];
  }
  const specs = resolveSpriteSpecs(stepId, item);
  const results: string[] = [];
  for (const spec of specs) {
    const key = `${spec.sheet}:${spec.col}:${spec.row}`;
    if (spec.splitPieces) {
      const multi = splitSpritesCache.get(key);
      if (multi && multi.length > 0) {
        results.push(...multi);
        continue;
      }
    }
    const single = cutoutCellCache.get(key);
    if (single) results.push(single);
  }
  if (results.length > 0) return results;

  const fallbackSpec = resolveCardSpec(stepId, item);
  const fb = slicedCellCache.get(`${fallbackSpec.sheet}:${fallbackSpec.col}:${fallbackSpec.row}`);
  return fb ? [fb] : [];
}

export function getIngredientCutout(
  stepId: string,
  item: Pick<BuilderOptionItem, 'id' | 'name' | 'color' | 'imageUrl'>
): string {
  const sprites = getIngredientSprites(stepId, item);
  return sprites[0] || '';
}

export function getSizeThumbnail(
  size: Pick<BuilderSize, 'id' | 'kind' | 'volume' | 'isDoseDupla'>
): string {
  if (size.kind === 'copo') {
    return realCupTopdownBasePhoto;
  }
  return realBowlTopdownBasePhoto;
}

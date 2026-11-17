import sheetBuilderSizes from '../assets/images/menu_builder_sizes_grid_1794829834071.jpg';
import sheetTigelinhasCopinhos from '../assets/images/menu_tigelinhas_copinhos_grid_1794829836317.jpg';
import sheetSorvetesPaletasSalada from '../assets/images/menu_sorvetes_paletas_salada_grid_1794829837647.jpg';
import sheetMilkShakes from '../assets/images/menu_milkshakes_grid_1794829841143.jpg';
import sheetDrinksExtras from '../assets/images/menu_drinks_extras_grid_1794829843031.jpg';
import sheetBurgersFries1 from '../assets/images/menu_burgers_fries1_grid_1794829843932.jpg';
import sheetFries2Bebidas1 from '../assets/images/menu_fries2_bebidas1_grid_1794829846125.jpg';
import sheetBebidasExtras2 from '../assets/images/menu_bebidas_adicionais2_grid_1794829846935.jpg';

interface PhotoGridCell {
  sheet: string;
  col: number;
  row: number;
}

const PRODUCT_PHOTO_MAP: Record<string, PhotoGridCell> = {
  // TIGELINHAS ESPECIAIS (5)
  'tig-zone': { sheet: sheetTigelinhasCopinhos, col: 0, row: 0 },
  'tig-kids': { sheet: sheetTigelinhasCopinhos, col: 1, row: 0 },
  'tig-fantastico': { sheet: sheetTigelinhasCopinhos, col: 2, row: 0 },
  'tig-energetica': { sheet: sheetTigelinhasCopinhos, col: 0, row: 1 },
  'tig-malibu': { sheet: sheetTigelinhasCopinhos, col: 1, row: 1 },

  // COPINHOS EM CAMADAS (4)
  'cop-rei-pacoca': { sheet: sheetTigelinhasCopinhos, col: 2, row: 1 },
  'cop-chocolatudo': { sheet: sheetTigelinhasCopinhos, col: 0, row: 2 },
  'cop-supremo': { sheet: sheetTigelinhasCopinhos, col: 1, row: 2 },
  'cop-ninho-splash': { sheet: sheetTigelinhasCopinhos, col: 2, row: 2 },

  // SORVETE DE CREME (5)
  'sorv-cestinha': { sheet: sheetSorvetesPaletasSalada, col: 0, row: 0 },
  'sorv-1-bola': { sheet: sheetSorvetesPaletasSalada, col: 1, row: 0 },
  'sorv-2-bolas': { sheet: sheetSorvetesPaletasSalada, col: 2, row: 0 },
  'sorv-pote-500': { sheet: sheetSorvetesPaletasSalada, col: 0, row: 1 },
  'sorv-pote-1000': { sheet: sheetSorvetesPaletasSalada, col: 1, row: 1 },

  // PALETAS (3)
  'pal-frutas': { sheet: sheetSorvetesPaletasSalada, col: 2, row: 1 },
  'pal-cremosas': { sheet: sheetSorvetesPaletasSalada, col: 0, row: 2 },
  'pal-recheadas': { sheet: sheetSorvetesPaletasSalada, col: 1, row: 2 },

  // SALADA DE FRUTAS (1)
  'salada-300': { sheet: sheetSorvetesPaletasSalada, col: 2, row: 2 },

  // MILK SHAKES 400ml (8)
  'ms-doce-amendoim': { sheet: sheetMilkShakes, col: 0, row: 0 },
  'ms-negresco-ovo': { sheet: sheetMilkShakes, col: 1, row: 0 },
  'ms-acai-cupuacu': { sheet: sheetMilkShakes, col: 2, row: 0 },
  'ms-pacoca': { sheet: sheetMilkShakes, col: 0, row: 1 },
  'ms-ninho': { sheet: sheetMilkShakes, col: 1, row: 1 },
  'ms-nutella': { sheet: sheetMilkShakes, col: 2, row: 1 },
  'ms-cupuacu': { sheet: sheetMilkShakes, col: 0, row: 2 },
  'ms-morango': { sheet: sheetMilkShakes, col: 1, row: 2 },

  // DRINKS 400ml (5)
  'drk-nevada': { sheet: sheetDrinksExtras, col: 0, row: 0 },
  'drk-espanhola': { sheet: sheetDrinksExtras, col: 1, row: 0 },
  'drk-limonada': { sheet: sheetDrinksExtras, col: 2, row: 0 },
  'drk-aperol': { sheet: sheetDrinksExtras, col: 0, row: 1 },
  'drk-licor': { sheet: sheetDrinksExtras, col: 1, row: 1 },

  // HAMBURGUERIA - ARTESANAIS (6)
  'burg-xsimples': { sheet: sheetBurgersFries1, col: 0, row: 0 },
  'burg-xegg': { sheet: sheetBurgersFries1, col: 1, row: 0 },
  'burg-xsalada': { sheet: sheetBurgersFries1, col: 2, row: 0 },
  'burg-xcalabresa': { sheet: sheetBurgersFries1, col: 0, row: 1 },
  'burg-xbacon': { sheet: sheetBurgersFries1, col: 1, row: 1 },
  'burg-xtudo': { sheet: sheetBurgersFries1, col: 2, row: 1 },

  // BATATAS FRITAS (8)
  'fries-simples': { sheet: sheetBurgersFries1, col: 0, row: 2 },
  'fries-temperada': { sheet: sheetBurgersFries1, col: 1, row: 2 },
  'fries-aneis': { sheet: sheetBurgersFries1, col: 2, row: 2 },
  'fries-cheddar-bacon': { sheet: sheetFries2Bebidas1, col: 0, row: 0 },
  'fries-bacon-calabresa': { sheet: sheetFries2Bebidas1, col: 1, row: 0 },
  'fries-suprema': { sheet: sheetFries2Bebidas1, col: 2, row: 0 },
  'fries-overdose': { sheet: sheetFries2Bebidas1, col: 0, row: 1 },
  'fries-sertaneja': { sheet: sheetFries2Bebidas1, col: 1, row: 1 },

  // BEBIDAS (5)
  'beb-agua': { sheet: sheetFries2Bebidas1, col: 2, row: 1 },
  'beb-agua-gas': { sheet: sheetFries2Bebidas1, col: 0, row: 2 },
  'beb-coca': { sheet: sheetFries2Bebidas1, col: 1, row: 2 },
  'beb-fanta': { sheet: sheetFries2Bebidas1, col: 2, row: 2 },
  'beb-guarana': { sheet: sheetBebidasExtras2, col: 0, row: 0 },
};

const BUILDER_SIZE_PHOTO_MAP: Record<string, PhotoGridCell> = {
  'tigela-p': { sheet: sheetBuilderSizes, col: 0, row: 0 },
  'tigela-m': { sheet: sheetBuilderSizes, col: 1, row: 0 },
  'tigela-g': { sheet: sheetBuilderSizes, col: 2, row: 0 },
  'copo-250': { sheet: sheetBuilderSizes, col: 0, row: 1 },
  'copo-300': { sheet: sheetBuilderSizes, col: 1, row: 1 },
  'copo-400': { sheet: sheetBuilderSizes, col: 2, row: 1 },
  'copo-500': { sheet: sheetBuilderSizes, col: 0, row: 2 },
  'dose-copo-700': { sheet: sheetBuilderSizes, col: 1, row: 2 },
  'dose-tigela-gg': { sheet: sheetBuilderSizes, col: 2, row: 2 },
};

const ALL_PRODUCT_SHEETS = [
  sheetBuilderSizes,
  sheetTigelinhasCopinhos,
  sheetSorvetesPaletasSalada,
  sheetMilkShakes,
  sheetDrinksExtras,
  sheetBurgersFries1,
  sheetFries2Bebidas1,
  sheetBebidasExtras2,
];

const slicedPhotoCache = new Map<string, string>();
let preloadProductsPromise: Promise<void> | null = null;
let photosReadyFlag = false;

function sliceProductSheet(sheetUrl: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cellW = img.naturalWidth / 3;
      const cellH = img.naturalHeight / 3;
      const padX = cellW * 0.032;
      const padY = cellH * 0.032;
      const srcW = cellW - padX * 2;
      const srcH = cellH - padY * 2;
      const outSize = 360;

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
          slicedPhotoCache.set(
            `${sheetUrl}:${col}:${row}`,
            canvas.toDataURL('image/jpeg', 0.9)
          );
        }
      }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = sheetUrl;
  });
}

export function preloadProductPhotos(): Promise<void> {
  if (!preloadProductsPromise) {
    preloadProductsPromise = Promise.all(
      ALL_PRODUCT_SHEETS.map(sliceProductSheet)
    ).then(() => {
      photosReadyFlag = true;
    });
  }
  return preloadProductsPromise;
}

export function areProductPhotosReady(): boolean {
  return photosReadyFlag;
}

function getCellUrl(spec: PhotoGridCell | undefined): string {
  if (!spec) return '';
  return slicedPhotoCache.get(`${spec.sheet}:${spec.col}:${spec.row}`) || '';
}

/**
 * Returns true if `url` is empty or still uses one of the legacy generic `/images/products/*.jpg` paths.
 * Custom URLs uploaded by the store owner in Admin are preserved untouched!
 */
function isLegacyGenericUrl(url?: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  return trimmed.length === 0 || trimmed.startsWith('/images/products/');
}

export function resolveProductPhoto(productId: string, currentImageUrl?: string): string {
  if (!isLegacyGenericUrl(currentImageUrl)) {
    return currentImageUrl!;
  }
  const unique = getCellUrl(PRODUCT_PHOTO_MAP[productId]);
  if (unique) return unique;
  return currentImageUrl || '';
}

export function resolveBuilderSizePhoto(
  sizeId: string,
  kind: 'copo' | 'tigela'
): string {
  const exact = getCellUrl(BUILDER_SIZE_PHOTO_MAP[sizeId]);
  if (exact) return exact;
  const fallbackKey = kind === 'tigela' ? 'tigela-m' : 'copo-400';
  const fallback = getCellUrl(BUILDER_SIZE_PHOTO_MAP[fallbackKey]);
  if (fallback) return fallback;
  return kind === 'tigela' ? '/images/products/tigelinha.jpg' : '/images/products/copinho.jpg';
}

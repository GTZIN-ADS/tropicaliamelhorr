import bcrypt from 'bcryptjs';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_BUILDER_CONFIG,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
} from '../data/seedCatalog';
import {
  AdminReports,
  BuilderConfig,
  CartItem,
  MenuCategory,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StaffRole,
  StaffUser,
  StoreCatalogResponse,
  StoreSettings,
} from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { computeStoreOpen, generatePixPayload, normalizePhone } from './format';

interface StaffUserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
}

interface OrderDoc extends Order {
  customerToken: string;
}

let seedPromise: Promise<void> | null = null;
let staffSeedPromise: Promise<void> | null = null;

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

function sanitizeSettings(s: StoreSettings): Record<string, unknown> {
  return stripUndefined({
    storeName: String(s.storeName || 'Tropicália Açaí').slice(0, 120),
    logoUrl: String(s.logoUrl || ''),
    heroBowlUrl: String(s.heroBowlUrl || ''),
    heroVideoUrl: String(s.heroVideoUrl || ''),
    heroBannerUrl: String(s.heroBannerUrl || ''),
    teamPhotos: Array.isArray(s.teamPhotos) ? s.teamPhotos.slice(0, 25) : [],
    manualOpenOverride: s.manualOpenOverride || 'auto',
    openingHours: s.openingHours || DEFAULT_SETTINGS.openingHours,
    deliveryFee: Number(s.deliveryFee || 0),
    estimatedTime: String(s.estimatedTime || '20 a 30 min'),
    pickupAddress: String(s.pickupAddress || ''),
    pixKey: String(s.pixKey || ''),
    pixKeyDisplay: String(s.pixKeyDisplay || ''),
    pixReceiverName: String(s.pixReceiverName || ''),
    pixReceiverCity: String(s.pixReceiverCity || ''),
    whatsappNumber: String(s.whatsappNumber || ''),
    instagramHandle: String(s.instagramHandle || ''),
    statusMessages: s.statusMessages || DEFAULT_SETTINGS.statusMessages,
    updatedAt: new Date().toISOString(),
  });
}

function sanitizeBuilder(c: BuilderConfig): Record<string, unknown> {
  return stripUndefined({
    sizes: Array.isArray(c.sizes) ? c.sizes : [],
    doseDupla: Array.isArray(c.doseDupla) ? c.doseDupla : [],
    steps: Array.isArray(c.steps) ? c.steps : [],
    updatedAt: new Date().toISOString(),
  });
}

function sanitizeCategory(c: MenuCategory): MenuCategory {
  return stripUndefined({
    id: String(c.id),
    slug: String(c.slug || c.id),
    name: String(c.name || ''),
    subtitle: String(c.subtitle || ''),
    sortOrder: Math.max(0, Math.round(Number(c.sortOrder || 0))),
    isStar: Boolean(c.isStar),
    layoutType: c.layoutType || 'list',
  });
}

function sanitizeProduct(p: Product): Product {
  return stripUndefined({
    id: String(p.id),
    categoryId: String(p.categoryId || ''),
    name: String(p.name || ''),
    description: String(p.description || ''),
    price: Number(p.price || 0),
    imageUrl: String(p.imageUrl || ''),
    badge: String(p.badge || ''),
    available: p.available !== false,
    sortOrder: Math.max(0, Math.round(Number(p.sortOrder || 0))),
    alcoholWarning: Boolean(p.alcoholWarning),
    optionGroups: Array.isArray(p.optionGroups) ? p.optionGroups : [],
  });
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
}

function toPublicOrder(docData: OrderDoc): Order {
  const { customerToken: _omit, ...order } = docData;
  return order;
}

function toPublicStaff(u: StaffUserDoc): StaffUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
  };
}

export async function ensureStaffSeeded(): Promise<void> {
  if (!staffSeedPromise) {
    staffSeedPromise = (async () => {
      const ownerId = 'staff-owner-tropicalia';
      const ownerRef = doc(db, 'staff_users', ownerId);
      let snap;
      try {
        snap = await getDoc(ownerRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `staff_users/${ownerId}`);
      }
      if (!snap.exists()) {
        const now = new Date().toISOString();
        const ownerDoc: StaffUserDoc = {
          id: ownerId,
          name: 'Tropicália',
          email: 'tropicalia@gmail.com',
          passwordHash: bcrypt.hashSync('melhor2027', 10),
          role: 'owner',
          active: true,
          createdAt: now,
        };
        try {
          await setDoc(ownerRef, ownerDoc);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `staff_users/${ownerId}`);
        }
      }
    })().catch((err) => {
      staffSeedPromise = null;
      throw err;
    });
  }
  return staffSeedPromise;
}

export async function ensureCatalogSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const settingsRef = doc(db, 'store_config', 'settings');
      const builderRef = doc(db, 'store_config', 'builder');
      const countersRef = doc(db, 'store_config', 'counters');

      let settingsSnap;
      try {
        settingsSnap = await getDoc(settingsRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'store_config/settings');
      }

      if (!settingsSnap.exists()) {
        try {
          await setDoc(settingsRef, sanitizeSettings(DEFAULT_SETTINGS));
          await setDoc(builderRef, sanitizeBuilder(DEFAULT_BUILDER_CONFIG));
          await setDoc(countersRef, {
            nextOrderNumber: 101,
            updatedAt: new Date().toISOString(),
          });

          const catBatch = writeBatch(db);
          for (const cat of DEFAULT_CATEGORIES) {
            catBatch.set(doc(db, 'categories', cat.id), sanitizeCategory(cat));
          }
          await catBatch.commit();

          const prodBatch = writeBatch(db);
          for (const prod of DEFAULT_PRODUCTS) {
            prodBatch.set(doc(db, 'products', prod.id), sanitizeProduct(prod));
          }
          await prodBatch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'store_config/settings');
        }
      } else {
        const [builderSnap, countersSnap] = await Promise.all([
          getDoc(builderRef),
          getDoc(countersRef),
        ]);
        if (!builderSnap.exists()) {
          await setDoc(builderRef, sanitizeBuilder(DEFAULT_BUILDER_CONFIG));
        }
        if (!countersSnap.exists()) {
          await setDoc(countersRef, {
            nextOrderNumber: 101,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

export async function fetchCatalogFromFirestore(): Promise<StoreCatalogResponse> {
  await ensureCatalogSeeded();
  try {
    const [settingsSnap, builderSnap, catsSnap, prodsSnap] = await Promise.all([
      getDoc(doc(db, 'store_config', 'settings')),
      getDoc(doc(db, 'store_config', 'builder')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'products')),
    ]);

    const settings = (settingsSnap.exists()
      ? (settingsSnap.data() as StoreSettings)
      : DEFAULT_SETTINGS);
    const builderConfig = (builderSnap.exists()
      ? (builderSnap.data() as BuilderConfig)
      : DEFAULT_BUILDER_CONFIG);
    const categories = catsSnap.docs
      .map((d) => d.data() as MenuCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const products = prodsSnap.docs
      .map((d) => d.data() as Product)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

    return {
      settings,
      categories,
      products,
      builderConfig,
      isOpenNow: computeStoreOpen(settings),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'store_config');
  }
}

export function subscribeCatalogRealtime(
  onCatalog: (catalog: StoreCatalogResponse) => void,
  onError?: (err: unknown) => void
): () => void {
  let active = true;
  let unsubs: Array<() => void> = [];

  let currentSettings: StoreSettings | null = null;
  let currentBuilder: BuilderConfig | null = null;
  let currentCategories: MenuCategory[] | null = null;
  let currentProducts: Product[] | null = null;

  const emitIfReady = () => {
    if (!active) return;
    if (!currentSettings || !currentBuilder || !currentCategories || !currentProducts) return;
    onCatalog({
      settings: currentSettings,
      categories: currentCategories,
      products: currentProducts,
      builderConfig: currentBuilder,
      isOpenNow: computeStoreOpen(currentSettings),
    });
  };

  ensureCatalogSeeded()
    .then(() => {
      if (!active) return;
      unsubs = [
        onSnapshot(
          doc(db, 'store_config', 'settings'),
          (snap) => {
            currentSettings = snap.exists()
              ? (snap.data() as StoreSettings)
              : DEFAULT_SETTINGS;
            emitIfReady();
          },
          (err) => {
            onError?.(err);
            handleFirestoreError(err, OperationType.GET, 'store_config/settings');
          }
        ),
        onSnapshot(
          doc(db, 'store_config', 'builder'),
          (snap) => {
            currentBuilder = snap.exists()
              ? (snap.data() as BuilderConfig)
              : DEFAULT_BUILDER_CONFIG;
            emitIfReady();
          },
          (err) => {
            onError?.(err);
            handleFirestoreError(err, OperationType.GET, 'store_config/builder');
          }
        ),
        onSnapshot(
          collection(db, 'categories'),
          (snap) => {
            currentCategories = snap.docs
              .map((d) => d.data() as MenuCategory)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            emitIfReady();
          },
          (err) => {
            onError?.(err);
            handleFirestoreError(err, OperationType.LIST, 'categories');
          }
        ),
        onSnapshot(
          collection(db, 'products'),
          (snap) => {
            currentProducts = snap.docs
              .map((d) => d.data() as Product)
              .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
            emitIfReady();
          },
          (err) => {
            onError?.(err);
            handleFirestoreError(err, OperationType.LIST, 'products');
          }
        ),
      ];
    })
    .catch((err) => {
      onError?.(err);
    });

  return () => {
    active = false;
    unsubs.forEach((u) => u());
  };
}

export function subscribeCustomerOrdersRealtime(
  customerToken: string,
  whatsapp: string,
  onOrders: (orders: Order[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!customerToken || customerToken.length < 12) {
    onOrders([]);
    return () => {};
  }

  const byToken = new Map<string, Order>();
  const byPhone = new Map<string, Order>();

  const emitMerged = () => {
    const merged = new Map<string, Order>();
    for (const [id, o] of byToken) merged.set(id, o);
    for (const [id, o] of byPhone) merged.set(id, o);
    const list = Array.from(merged.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    onOrders(list);
  };

  const unsubToken = onSnapshot(
    query(collection(db, 'orders'), where('customerToken', '==', customerToken)),
    (snap) => {
      byToken.clear();
      snap.docs.forEach((d) => {
        const order = toPublicOrder(d.data() as OrderDoc);
        byToken.set(order.id, order);
      });
      emitMerged();
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }
  );

  const cleanPhone = normalizePhone(whatsapp || '');
  let unsubPhone: (() => void) | null = null;
  if (cleanPhone.length >= 10) {
    unsubPhone = onSnapshot(
      query(collection(db, 'orders'), where('customerWhatsapp', '==', cleanPhone)),
      (snap) => {
        byPhone.clear();
        snap.docs.forEach((d) => {
          const order = toPublicOrder(d.data() as OrderDoc);
          byPhone.set(order.id, order);
        });
        emitMerged();
      },
      (err) => {
        onError?.(err);
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );
  }

  return () => {
    unsubToken();
    unsubPhone?.();
  };
}

export function subscribeAdminOrdersRealtime(
  onOrders: (orders: Order[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, 'orders'),
    (snap) => {
      const list = snap.docs
        .map((d) => toPublicOrder(d.data() as OrderDoc))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onOrders(list);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }
  );
}

async function fileToCompactDataUrl(file: File, maxBytes = 360_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      if (!file.type.startsWith('image/')) {
        if (result.length > maxBytes) {
          reject(new Error('Arquivo PDF muito grande. Envie uma imagem ou foto do comprovante.'));
          return;
        }
        resolve(result);
        return;
      }
      if (result.length <= maxBytes) {
        resolve(result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const tryCompress = (maxSide: number, quality: number): string => {
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) return result;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', quality);
        };
        let encoded = tryCompress(900, 0.76);
        if (encoded.length > maxBytes) encoded = tryCompress(680, 0.65);
        if (encoded.length > maxBytes) encoded = tryCompress(480, 0.55);
        resolve(encoded);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== 'string') return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getHeader(headers: HeadersInit | undefined, name: string): string {
  if (!headers) return '';
  if (headers instanceof Headers) return headers.get(name) || '';
  if (Array.isArray(headers)) {
    const found = headers.find(([k]) => k.toLowerCase() === name.toLowerCase());
    return found ? found[1] : '';
  }
  const record = headers as Record<string, string>;
  const key = Object.keys(record).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? record[key] : '';
}

async function resolveStaffFromAuthHeader(init?: RequestInit): Promise<StaffUserDoc | null> {
  const auth = getHeader(init?.headers, 'Authorization');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;

  // Format: fbstaff::<staffId>::<nonce>
  const parts = token.split('::');
  if (parts.length !== 3 || parts[0] !== 'fbstaff') return null;
  const staffId = sanitizeId(parts[1]);
  if (!staffId) return null;

  await ensureStaffSeeded();
  try {
    const snap = await getDoc(doc(db, 'staff_users', staffId));
    if (!snap.exists()) return null;
    const user = snap.data() as StaffUserDoc;
    if (!user.active) return null;
    return user;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `staff_users/${staffId}`);
  }
}

export async function handleFirebaseRequest(
  rawUrl: string,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const parsed = new URL(rawUrl, window.location.origin);
  const pathname = parsed.pathname;

  if (method === 'GET' && pathname === '/api/health') {
    return jsonResponse({ ok: true, mode: 'firebase', ts: Date.now() });
  }

  // PUBLIC: Store catalog
  if (method === 'GET' && pathname === '/api/store/catalog') {
    const catalog = await fetchCatalogFromFirestore();
    return jsonResponse(catalog);
  }

  // PUBLIC: Create order (atomic sequential orderNumber + persisted permanently in Firestore)
  if (method === 'POST' && pathname === '/api/orders') {
    await ensureCatalogSeeded();
    const body = parseBody(init) as {
      customerName?: string;
      customerWhatsapp?: string;
      customerToken?: string;
      deliveryType?: 'delivery' | 'pickup';
      address?: Order['address'];
      paymentMethod?: PaymentMethod;
      cashChangeFor?: number | null;
      items?: CartItem[];
    };

    const cleanWhatsapp = normalizePhone(body.customerWhatsapp || '');
    if (!body.customerName?.trim() || cleanWhatsapp.length < 10) {
      return jsonResponse({ error: 'Informe seu nome completo e um WhatsApp válido com DDD.' }, 400);
    }
    if (!body.customerToken || body.customerToken.length < 12) {
      return jsonResponse({ error: 'Token de sessão do cliente inválido.' }, 400);
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return jsonResponse({ error: 'Seu carrinho está vazio.' }, 400);
    }
    if (
      body.deliveryType === 'delivery' &&
      (!body.address?.street?.trim() ||
        !body.address?.number?.trim() ||
        !body.address?.neighborhood?.trim())
    ) {
      return jsonResponse({ error: 'Preencha rua, número e bairro para a entrega.' }, 400);
    }

    const settingsSnap = await getDoc(doc(db, 'store_config', 'settings'));
    const settings = settingsSnap.exists()
      ? (settingsSnap.data() as StoreSettings)
      : DEFAULT_SETTINGS;

    if (!computeStoreOpen(settings)) {
      return jsonResponse(
        { error: 'A loja está fechada no momento. Confira o horário de funcionamento.' },
        400
      );
    }

    const subtotal = Number(
      body.items
        .reduce((acc, i) => acc + Number(i.unitPrice) * Number(i.quantity), 0)
        .toFixed(2)
    );
    const deliveryFee = body.deliveryType === 'delivery' ? Number(settings.deliveryFee) : 0;
    const total = Number((subtotal + deliveryFee).toFixed(2));
    const paymentMethod: PaymentMethod = body.paymentMethod || 'pix';
    const initialStatus: OrderStatus = paymentMethod === 'pix' ? 'awaiting_payment' : 'pending';
    const orderId = sanitizeId(
      `ord_${
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      }`
    );
    const now = new Date().toISOString();

    try {
      const createdOrder = await runTransaction(db, async (tx) => {
        const counterRef = doc(db, 'store_config', 'counters');
        const counterSnap = await tx.get(counterRef);
        const currentNext = counterSnap.exists()
          ? Number((counterSnap.data() as { nextOrderNumber: number }).nextOrderNumber || 101)
          : 101;
        const orderNumber = Math.max(100, Math.round(currentNext));

        tx.set(counterRef, {
          nextOrderNumber: orderNumber + 1,
          updatedAt: now,
        });

        const pixCode =
          paymentMethod === 'pix'
            ? generatePixPayload({
                pixKey: settings.pixKey,
                receiverName: settings.pixReceiverName,
                receiverCity: settings.pixReceiverCity,
                amount: total,
                txId: `TROP${orderNumber}`,
              })
            : null;

        const cleanAddress =
          body.deliveryType === 'delivery' && body.address
            ? stripUndefined({
                street: body.address.street.trim(),
                number: body.address.number.trim(),
                neighborhood: body.address.neighborhood.trim(),
                reference: (body.address.reference || '').trim(),
                ...(typeof body.address.lat === 'number' ? { lat: body.address.lat } : {}),
                ...(typeof body.address.lng === 'number' ? { lng: body.address.lng } : {}),
              })
            : null;

        const orderDoc: OrderDoc = stripUndefined({
          id: orderId,
          orderNumber,
          customerName: body.customerName!.trim().slice(0, 160),
          customerWhatsapp: cleanWhatsapp.slice(0, 30),
          customerToken: body.customerToken!.slice(0, 128),
          deliveryType: body.deliveryType || 'delivery',
          address: cleanAddress,
          paymentMethod,
          cashChangeFor:
            paymentMethod === 'cash' && typeof body.cashChangeFor === 'number'
              ? body.cashChangeFor
              : null,
          pixCode,
          pixReceiptUrl: null,
          pixReceiptName: null,
          pixConfirmed: false,
          items: body.items!.slice(0, 50),
          subtotal,
          deliveryFee,
          total,
          status: initialStatus,
          cancelReason: null,
          createdAt: now,
          updatedAt: now,
        });

        tx.set(doc(db, 'orders', orderId), orderDoc);
        return toPublicOrder(orderDoc);
      });

      return jsonResponse(createdOrder, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    }
  }

  // PUBLIC: Customer's orders
  if (method === 'GET' && pathname === '/api/orders/mine') {
    const token = parsed.searchParams.get('token') || '';
    const whatsapp = normalizePhone(parsed.searchParams.get('whatsapp') || '');
    if (!token || token.length < 12) return jsonResponse([]);

    try {
      const merged = new Map<string, Order>();
      const tokenSnap = await getDocs(
        query(collection(db, 'orders'), where('customerToken', '==', token))
      );
      tokenSnap.docs.forEach((d) => {
        const order = toPublicOrder(d.data() as OrderDoc);
        merged.set(order.id, order);
      });

      if (whatsapp.length >= 10) {
        const phoneSnap = await getDocs(
          query(collection(db, 'orders'), where('customerWhatsapp', '==', whatsapp))
        );
        phoneSnap.docs.forEach((d) => {
          const order = toPublicOrder(d.data() as OrderDoc);
          merged.set(order.id, order);
        });
      }

      const list = Array.from(merged.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return jsonResponse(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }
  }

  // PUBLIC: Upload Pix receipt
  const receiptMatch = pathname.match(/^\/api\/orders\/([^/]+)\/receipt$/);
  if (method === 'POST' && receiptMatch) {
    const orderId = sanitizeId(receiptMatch[1]);
    if (!(init?.body instanceof FormData)) {
      return jsonResponse({ error: 'Envie uma foto (JPG/PNG/WEBP) ou arquivo PDF válido.' }, 400);
    }
    const token = String(init.body.get('customerToken') || parsed.searchParams.get('token') || '');
    const file = init.body.get('receipt');
    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Envie uma foto (JPG/PNG/WEBP) ou arquivo PDF válido.' }, 400);
    }

    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return jsonResponse({ error: 'Pedido não encontrado.' }, 404);
    const existing = snap.data() as OrderDoc;
    if (existing.customerToken !== token) {
      return jsonResponse({ error: 'Acesso negado a este pedido.' }, 403);
    }

    let dataUrl: string;
    try {
      dataUrl = await fileToCompactDataUrl(file, 480_000);
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'Arquivo muito grande.' },
        400
      );
    }

    const nextStatus: OrderStatus =
      existing.status === 'awaiting_payment' ? 'pending' : existing.status;
    const now = new Date().toISOString();

    try {
      await updateDoc(orderRef, {
        pixReceiptUrl: dataUrl,
        pixReceiptName: file.name.slice(0, 240),
        status: nextStatus,
        updatedAt: now,
      });
      const updated: OrderDoc = {
        ...existing,
        pixReceiptUrl: dataUrl,
        pixReceiptName: file.name.slice(0, 240),
        status: nextStatus,
        updatedAt: now,
      };
      return jsonResponse(toPublicOrder(updated));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  }

  // AUTH: Login
  if (method === 'POST' && pathname === '/api/auth/login') {
    await ensureStaffSeeded();
    const body = parseBody(init) as { email?: string; password?: string };
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!email || !password) {
      return jsonResponse({ error: 'Informe e-mail e senha.' }, 400);
    }

    try {
      const snap = await getDocs(
        query(collection(db, 'staff_users'), where('active', '==', true))
      );
      const users = snap.docs.map((d) => d.data() as StaffUserDoc);
      const user = users.find((u) => u.email.trim().toLowerCase() === email);
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return jsonResponse({ error: 'E-mail ou senha inválidos. Confira e tente novamente.' }, 401);
      }

      const nonce =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const token = `fbstaff::${user.id}::${nonce}`;
      return jsonResponse({ token, user: toPublicStaff(user) });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'staff_users');
    }
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    return jsonResponse({ ok: true });
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    const user = await resolveStaffFromAuthHeader(init);
    if (!user) return jsonResponse({ error: 'Sessão expirada ou não autenticada.' }, 401);
    return jsonResponse({ user: toPublicStaff(user) });
  }

  // PROTECTED ADMIN ROUTES
  const authed = await resolveStaffFromAuthHeader(init);
  if (!authed) {
    return jsonResponse({ error: 'Sessão expirada ou não autenticada. Faça login novamente.' }, 401);
  }

  if (method === 'GET' && pathname === '/api/admin/orders') {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list = snap.docs
        .map((d) => toPublicOrder(d.data() as OrderDoc))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return jsonResponse(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }
  }

  const confirmPixMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/confirm-pix$/);
  if (method === 'POST' && confirmPixMatch) {
    const orderId = sanitizeId(confirmPixMatch[1]);
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return jsonResponse({ error: 'Pedido não encontrado.' }, 404);
    const existing = snap.data() as OrderDoc;
    const nextStatus: OrderStatus =
      existing.status === 'awaiting_payment' || existing.status === 'pending'
        ? 'preparing'
        : existing.status;
    const now = new Date().toISOString();

    try {
      await updateDoc(orderRef, {
        pixConfirmed: true,
        status: nextStatus,
        updatedAt: now,
      });
      return jsonResponse(
        toPublicOrder({ ...existing, pixConfirmed: true, status: nextStatus, updatedAt: now })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  }

  const statusMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
  if (method === 'PATCH' && statusMatch) {
    const orderId = sanitizeId(statusMatch[1]);
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return jsonResponse({ error: 'Pedido não encontrado.' }, 404);
    const existing = snap.data() as OrderDoc;
    const body = parseBody(init) as { status: OrderStatus; cancelReason?: string };

    if (
      existing.paymentMethod === 'pix' &&
      !existing.pixConfirmed &&
      ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(body.status)
    ) {
      return jsonResponse(
        { error: 'Confirme o pagamento do Pix antes de iniciar o preparo deste pedido.' },
        400
      );
    }

    const now = new Date().toISOString();
    const cancelReason =
      body.status === 'cancelled'
        ? (body.cancelReason || 'Pedido recusado pela loja.').slice(0, 300)
        : existing.cancelReason ?? null;

    try {
      await updateDoc(orderRef, {
        status: body.status,
        cancelReason,
        updatedAt: now,
      });
      return jsonResponse(
        toPublicOrder({ ...existing, status: body.status, cancelReason, updatedAt: now })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  }

  const availMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)\/availability$/);
  if (method === 'PATCH' && availMatch) {
    const prodId = sanitizeId(availMatch[1]);
    const prodRef = doc(db, 'products', prodId);
    const snap = await getDoc(prodRef);
    if (!snap.exists()) return jsonResponse({ error: 'Produto não encontrado.' }, 404);
    const body = parseBody(init) as { available?: boolean };
    const available = Boolean(body.available);
    try {
      await updateDoc(prodRef, { available });
      return jsonResponse({ ok: true, available });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${prodId}`);
    }
  }

  if (method === 'PATCH' && pathname === '/api/admin/store-open') {
    const body = parseBody(init) as { manualOpenOverride: StoreSettings['manualOpenOverride'] };
    const settingsRef = doc(db, 'store_config', 'settings');
    const snap = await getDoc(settingsRef);
    const current = snap.exists() ? (snap.data() as StoreSettings) : DEFAULT_SETTINGS;
    const next: StoreSettings = { ...current, manualOpenOverride: body.manualOpenOverride };
    try {
      await setDoc(settingsRef, sanitizeSettings(next));
      return jsonResponse({ settings: next, isOpenNow: computeStoreOpen(next) });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'store_config/settings');
    }
  }

  // OWNER-ONLY
  if (authed.role !== 'owner') {
    return jsonResponse({ error: 'Acesso exclusivo do perfil Dono.' }, 403);
  }

  if (method === 'POST' && pathname === '/api/admin/upload') {
    if (!(init?.body instanceof FormData)) {
      return jsonResponse({ error: 'Nenhum arquivo enviado.' }, 400);
    }
    const file = init.body.get('file');
    if (!(file instanceof File)) return jsonResponse({ error: 'Nenhum arquivo enviado.' }, 400);
    try {
      const url = await fileToCompactDataUrl(file, 380_000);
      return jsonResponse({ url, name: file.name });
    } catch (err) {
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'Falha ao processar imagem.' },
        400
      );
    }
  }

  if (method === 'PUT' && pathname === '/api/admin/settings') {
    const body = parseBody(init) as Partial<StoreSettings>;
    const settingsRef = doc(db, 'store_config', 'settings');
    const snap = await getDoc(settingsRef);
    const current = snap.exists() ? (snap.data() as StoreSettings) : DEFAULT_SETTINGS;
    const next: StoreSettings = { ...current, ...body };
    try {
      await setDoc(settingsRef, sanitizeSettings(next));
      return jsonResponse({ settings: next, isOpenNow: computeStoreOpen(next) });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'store_config/settings');
    }
  }

  if (method === 'PUT' && pathname === '/api/admin/builder') {
    const config = parseBody(init) as unknown as BuilderConfig;
    try {
      await setDoc(doc(db, 'store_config', 'builder'), sanitizeBuilder(config));
      return jsonResponse(config);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'store_config/builder');
    }
  }

  if (method === 'POST' && pathname === '/api/admin/categories') {
    const body = parseBody(init) as Partial<MenuCategory>;
    if (!body.name?.trim()) return jsonResponse({ error: 'Informe o nome da categoria.' }, 400);
    const catsSnap = await getDocs(collection(db, 'categories'));
    const existingCats = catsSnap.docs.map((d) => d.data() as MenuCategory);
    const maxSort = existingCats.reduce((m, c) => Math.max(m, c.sortOrder), 0);
    const id = sanitizeId(`cat-${Date.now().toString(36)}`);
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');
    const newCat = sanitizeCategory({
      id,
      slug,
      name: body.name.trim(),
      subtitle: body.subtitle || '',
      sortOrder: maxSort + 1,
      isStar: Boolean(body.isStar),
      layoutType: body.layoutType || 'list',
    });
    try {
      await setDoc(doc(db, 'categories', id), newCat);
      return jsonResponse([...existingCats, newCat].sort((a, b) => a.sortOrder - b.sortOrder), 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    }
  }

  if (method === 'POST' && pathname === '/api/admin/categories/reorder') {
    const body = parseBody(init) as { orderedIds?: string[] };
    if (Array.isArray(body.orderedIds)) {
      const batch = writeBatch(db);
      body.orderedIds.forEach((rawId, idx) => {
        const id = sanitizeId(rawId);
        batch.update(doc(db, 'categories', id), { sortOrder: idx + 1 });
      });
      await batch.commit();
    }
    const snap = await getDocs(collection(db, 'categories'));
    return jsonResponse(
      snap.docs.map((d) => d.data() as MenuCategory).sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  const catIdMatch = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (catIdMatch && method === 'PUT') {
    const id = sanitizeId(catIdMatch[1]);
    const body = parseBody(init) as Partial<MenuCategory>;
    const catRef = doc(db, 'categories', id);
    const snap = await getDoc(catRef);
    if (snap.exists()) {
      const prev = snap.data() as MenuCategory;
      await setDoc(
        catRef,
        sanitizeCategory({
          ...prev,
          name: body.name ?? prev.name,
          subtitle: body.subtitle ?? prev.subtitle,
          isStar: body.isStar !== undefined ? Boolean(body.isStar) : prev.isStar,
          layoutType: body.layoutType || prev.layoutType,
        })
      );
    }
    const allSnap = await getDocs(collection(db, 'categories'));
    return jsonResponse(
      allSnap.docs.map((d) => d.data() as MenuCategory).sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  if (catIdMatch && method === 'DELETE') {
    const id = sanitizeId(catIdMatch[1]);
    const prodSnap = await getDocs(query(collection(db, 'products'), where('categoryId', '==', id)));
    const batch = writeBatch(db);
    prodSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, 'categories', id));
    await batch.commit();
    return jsonResponse({ ok: true });
  }

  if (method === 'POST' && pathname === '/api/admin/products') {
    const p = parseBody(init) as Partial<Product>;
    if (!p.name?.trim() || !p.categoryId) {
      return jsonResponse({ error: 'Nome e categoria são obrigatórios.' }, 400);
    }
    const prodsSnap = await getDocs(collection(db, 'products'));
    const allProds = prodsSnap.docs.map((d) => d.data() as Product);
    const maxSort = allProds
      .filter((pr) => pr.categoryId === p.categoryId)
      .reduce((m, pr) => Math.max(m, pr.sortOrder), 0);
    const id = sanitizeId(`prod-${Date.now().toString(36)}`);
    const newProd = sanitizeProduct({
      id,
      categoryId: p.categoryId,
      name: p.name.trim(),
      description: p.description || '',
      price: Number(p.price || 0),
      imageUrl: p.imageUrl || '',
      badge: p.badge || '',
      available: p.available !== false,
      sortOrder: maxSort + 1,
      alcoholWarning: Boolean(p.alcoholWarning),
      optionGroups: p.optionGroups || [],
    });
    try {
      await setDoc(doc(db, 'products', id), newProd);
      return jsonResponse(
        [...allProds, newProd].sort((a, b) => a.sortOrder - b.sortOrder),
        201
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
    }
  }

  if (method === 'POST' && pathname === '/api/admin/products/reorder') {
    const body = parseBody(init) as { orderedIds?: string[] };
    if (Array.isArray(body.orderedIds)) {
      const batch = writeBatch(db);
      body.orderedIds.forEach((rawId, idx) => {
        const id = sanitizeId(rawId);
        batch.update(doc(db, 'products', id), { sortOrder: idx + 1 });
      });
      await batch.commit();
    }
    const snap = await getDocs(collection(db, 'products'));
    return jsonResponse(
      snap.docs.map((d) => d.data() as Product).sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  const dupMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)\/duplicate$/);
  if (method === 'POST' && dupMatch) {
    const origId = sanitizeId(dupMatch[1]);
    const origSnap = await getDoc(doc(db, 'products', origId));
    if (!origSnap.exists()) return jsonResponse({ error: 'Produto não encontrado.' }, 404);
    const orig = origSnap.data() as Product;
    const id = sanitizeId(`prod-${Date.now().toString(36)}`);
    const copy = sanitizeProduct({
      ...orig,
      id,
      name: `${orig.name} (Cópia)`,
      sortOrder: orig.sortOrder + 1,
    });
    await setDoc(doc(db, 'products', id), copy);
    const snap = await getDocs(collection(db, 'products'));
    return jsonResponse(
      snap.docs.map((d) => d.data() as Product).sort((a, b) => a.sortOrder - b.sortOrder),
      201
    );
  }

  const prodIdMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (prodIdMatch && method === 'PUT') {
    const id = sanitizeId(prodIdMatch[1]);
    const p = parseBody(init) as Partial<Product>;
    const prodRef = doc(db, 'products', id);
    const snap = await getDoc(prodRef);
    if (snap.exists()) {
      const prev = snap.data() as Product;
      await setDoc(
        prodRef,
        sanitizeProduct({
          ...prev,
          categoryId: p.categoryId || prev.categoryId,
          name: p.name ?? prev.name,
          description: p.description ?? prev.description,
          price: p.price !== undefined ? Number(p.price) : prev.price,
          imageUrl: p.imageUrl ?? prev.imageUrl,
          badge: p.badge ?? prev.badge,
          available: p.available !== undefined ? Boolean(p.available) : prev.available,
          alcoholWarning:
            p.alcoholWarning !== undefined ? Boolean(p.alcoholWarning) : prev.alcoholWarning,
          optionGroups: p.optionGroups || prev.optionGroups,
        })
      );
    }
    const allSnap = await getDocs(collection(db, 'products'));
    return jsonResponse(
      allSnap.docs.map((d) => d.data() as Product).sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  if (prodIdMatch && method === 'DELETE') {
    const id = sanitizeId(prodIdMatch[1]);
    await deleteDoc(doc(db, 'products', id));
    return jsonResponse({ ok: true });
  }

  if (method === 'GET' && pathname === '/api/admin/reports') {
    const snap = await getDocs(collection(db, 'orders'));
    const orders = snap.docs
      .map((d) => toPublicOrder(d.data() as OrderDoc))
      .filter((o) => o.status !== 'cancelled');

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === todayStr);
    const yesterdayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === yesterdayStr);
    const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((acc, o) => acc + o.total, 0);
    const todayCount = todayOrders.length;
    const yesterdayCount = yesterdayOrders.length;
    const averageTicket = todayCount > 0 ? todayRevenue / todayCount : 0;

    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const payMap = new Map<PaymentMethod, { method: PaymentMethod; count: number; total: number }>([
      ['pix', { method: 'pix', count: 0, total: 0 }],
      ['card', { method: 'card', count: 0, total: 0 }],
      ['cash', { method: 'cash', count: 0, total: 0 }],
    ]);
    const hourMap = new Map<number, { count: number; revenue: number }>();

    for (const o of todayOrders) {
      const pay = payMap.get(o.paymentMethod)!;
      pay.count += 1;
      pay.total += o.total;
      const hr = new Date(o.createdAt).getHours();
      const hrEntry = hourMap.get(hr) || { count: 0, revenue: 0 };
      hrEntry.count += 1;
      hrEntry.revenue += o.total;
      hourMap.set(hr, hrEntry);
      for (const item of o.items) {
        const cur = itemMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
        cur.quantity += item.quantity;
        cur.revenue += item.unitPrice * item.quantity;
        itemMap.set(item.name, cur);
      }
    }

    const report: AdminReports = {
      todayRevenue,
      yesterdayRevenue,
      todayCount,
      yesterdayCount,
      averageTicket,
      topItems: Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 6),
      byPayment: Array.from(payMap.values()),
      byHour: Array.from({ length: 12 }, (_, idx) => {
        const h = idx + 12;
        const found = hourMap.get(h) || { count: 0, revenue: 0 };
        return { hour: `${h}h`, count: found.count, revenue: found.revenue };
      }),
    };
    return jsonResponse(report);
  }

  if (method === 'GET' && pathname === '/api/admin/users') {
    await ensureStaffSeeded();
    const snap = await getDocs(collection(db, 'staff_users'));
    const list = snap.docs
      .map((d) => toPublicStaff(d.data() as StaffUserDoc))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return jsonResponse(list);
  }

  if (method === 'POST' && pathname === '/api/admin/users') {
    const body = parseBody(init) as {
      name?: string;
      email?: string;
      password?: string;
      role?: StaffRole;
    };
    if (!body.name?.trim() || !body.email?.trim() || !body.password || body.password.length < 6) {
      return jsonResponse({ error: 'Preencha nome, e-mail e senha (mínimo 6 caracteres).' }, 400);
    }
    const snap = await getDocs(collection(db, 'staff_users'));
    const exists = snap.docs.some(
      (d) => (d.data() as StaffUserDoc).email.toLowerCase() === body.email!.trim().toLowerCase()
    );
    if (exists) {
      return jsonResponse({ error: 'Já existe um usuário com este e-mail.' }, 400);
    }
    const id = sanitizeId(`staff-${Date.now().toString(36)}`);
    const newUser: StaffUserDoc = {
      id,
      name: body.name.trim().slice(0, 120),
      email: body.email.trim().slice(0, 160),
      passwordHash: bcrypt.hashSync(body.password, 10),
      role: body.role === 'owner' ? 'owner' : 'attendant',
      active: true,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'staff_users', id), newUser);
    return jsonResponse({ ok: true }, 201);
  }

  const userIdMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userIdMatch && method === 'PATCH') {
    const id = sanitizeId(userIdMatch[1]);
    const userRef = doc(db, 'staff_users', id);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return jsonResponse({ error: 'Usuário não encontrado.' }, 404);
    const prev = snap.data() as StaffUserDoc;
    const body = parseBody(init) as {
      name?: string;
      role?: StaffRole;
      active?: boolean;
      password?: string;
    };
    const next: StaffUserDoc = {
      ...prev,
      name: body.name ? body.name.trim().slice(0, 120) : prev.name,
      role: body.role || prev.role,
      active: typeof body.active === 'boolean' ? body.active : prev.active,
      passwordHash:
        body.password && body.password.length >= 6
          ? bcrypt.hashSync(body.password, 10)
          : prev.passwordHash,
    };
    await setDoc(userRef, next);
    return jsonResponse({ ok: true });
  }

  if (userIdMatch && method === 'DELETE') {
    const id = sanitizeId(userIdMatch[1]);
    if (authed.id === id) {
      return jsonResponse({ error: 'Você não pode excluir sua própria conta logada.' }, 400);
    }
    await deleteDoc(doc(db, 'staff_users', id));
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: 'Rota não encontrada.' }, 404);
}

import {
  handleFirebaseRequest,
  subscribeAdminOrdersRealtime,
  subscribeCatalogRealtime,
  subscribeCustomerOrdersRealtime,
} from './firebaseApi';

export function isStandaloneMode(): boolean {
  return false;
}

export function subscribeLocalSync(): () => void {
  return () => {};
}

export {
  subscribeAdminOrdersRealtime,
  subscribeCatalogRealtime,
  subscribeCustomerOrdersRealtime,
};

export async function apiRequest(url: string, init?: RequestInit): Promise<Response> {
  return handleFirebaseRequest(url, init);
}

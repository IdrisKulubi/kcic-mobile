import * as SecureStore from 'expo-secure-store';

const LAST_AUTH_ROUTE_KEY = 'kcicmobile_last_auth_route';

export async function getLastAuthenticatedRoute() {
  return SecureStore.getItemAsync(LAST_AUTH_ROUTE_KEY);
}

export async function setLastAuthenticatedRoute(route: string) {
  await SecureStore.setItemAsync(LAST_AUTH_ROUTE_KEY, route);
}

export async function clearLastAuthenticatedRoute() {
  await SecureStore.deleteItemAsync(LAST_AUTH_ROUTE_KEY);
}


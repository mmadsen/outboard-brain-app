// AIDEV-NOTE: Secure storage for API key and base URL using expo-secure-store (iOS Keychain).
// The API key is NEVER logged or included in error reports.

import * as SecureStore from 'expo-secure-store';

const API_KEY_KEY = 'outboard_brain_api_key';
const BASE_URL_KEY = 'outboard_brain_base_url';

// AIDEV-NOTE: Default URL points to the production Supabase edge function.
// Users can override this in settings for dev/staging environments.
const DEFAULT_BASE_URL = 'https://fgsuhmrdlejsophbumxh.supabase.co/functions/v1/open-brain-mcp';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_KEY);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_KEY, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_KEY);
}

export async function getBaseUrl(): Promise<string> {
  const url = await SecureStore.getItemAsync(BASE_URL_KEY);
  return url || DEFAULT_BASE_URL;
}

export async function setBaseUrl(url: string): Promise<void> {
  if (url.trim()) {
    await SecureStore.setItemAsync(BASE_URL_KEY, url.trim());
  } else {
    // Reset to default
    await SecureStore.deleteItemAsync(BASE_URL_KEY);
  }
}

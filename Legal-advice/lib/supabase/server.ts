import { createClient as createShimClient } from './shim';

export async function createClient() {
  return createShimClient();
}

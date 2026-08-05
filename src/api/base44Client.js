import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { withArrayResults } from '@/api/safeEntities';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
const client = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

const entities = withArrayResults(client.entities);

export const base44 = new Proxy(client, {
  get(target, prop, receiver) {
    if (prop === 'entities') return entities;
    return Reflect.get(target, prop, receiver);
  }
});

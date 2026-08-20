import type { Request, Response } from 'express';
import { createApp } from '../server';

let appPromise: ReturnType<typeof createApp> | undefined;

export const config = {
  maxDuration: 30,
};

export default async function handler(req: Request, res: Response) {
  appPromise ??= createApp();
  const app = await appPromise;
  restoreApiPath(req);

  return app(req, res);
}

function restoreApiPath(req: Request) {
  const query = req.query as Record<string, unknown> | undefined;
  const rawPath = query?.path;
  const pathSegments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];
  const apiPath = pathSegments.map(String).filter(Boolean).join('/');

  if (!apiPath || req.url.startsWith('/api/')) {
    return;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (key === 'path' || value === undefined) {
      continue;
    }

    for (const entry of Array.isArray(value) ? value : [value]) {
      searchParams.append(key, String(entry));
    }
  }

  const search = searchParams.toString();
  req.url = `/api/${apiPath}${search ? `?${search}` : ''}`;
}

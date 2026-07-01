// Singleton Echo — initialisé une seule fois côté client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echoInstance: any = null;

export async function getEcho(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (echoInstance) return echoInstance;

  const key    = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const host   = process.env.NEXT_PUBLIC_PUSHER_HOST   || '127.0.0.1';
  const port   = parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT  || '6001', 10);
  const scheme = process.env.NEXT_PUBLIC_PUSHER_SCHEME || 'http';

  if (!key) return null;

  try {
    const [EchoModule, PusherModule] = await Promise.all([
      import('laravel-echo'),
      import('pusher-js'),
    ]);

    const EchoLib = EchoModule.default ?? EchoModule;
    (window as any).Pusher = PusherModule.default ?? PusherModule;

    echoInstance = new EchoLib({
      broadcaster:       'pusher',
      key,
      wsHost:            host,
      wsPort:            port,
      wssPort:           port,
      forceTLS:          scheme === 'https',
      encrypted:         false,
      disableStats:      true,
      enabledTransports: ['ws', 'wss'],
    });

    return echoInstance;
  } catch {
    return null;
  }
}

export function destroyEcho(): void {
  echoInstance?.disconnect?.();
  echoInstance = null;
}

// OneSignal Web SDK loader & helpers. App ID is publishable.
export const ONESIGNAL_APP_ID = "6fc4b9cc-7626-4f58-90f5-907013901ceb";

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

let initialized = false;

export function loadOneSignal(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (initialized) return Promise.resolve();
  initialized = true;
  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    const s = document.createElement("script");
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.defer = true;
    s.onload = () => {
      window.OneSignalDeferred!.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: { enable: false },
          });
        } catch (e) {
          console.warn("OneSignal init failed", e);
        }
        resolve();
      });
    };
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

export async function subscribeToPush(): Promise<string | null> {
  await loadOneSignal();
  return new Promise((resolve) => {
    window.OneSignalDeferred!.push(async (OneSignal: any) => {
      try {
        await OneSignal.Notifications.requestPermission();
        // SDK v16: subscription id is the player id
        const id = OneSignal.User?.PushSubscription?.id ?? null;
        resolve(id);
      } catch {
        resolve(null);
      }
    });
  });
}
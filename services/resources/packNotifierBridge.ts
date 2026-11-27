type StoreNotifier = () => void;

let packsStoreNotifier: StoreNotifier | null = null;

export function registerPacksStoreNotifier(notifier: StoreNotifier): void {
    packsStoreNotifier = notifier;
}

export function notifyPacksStore(): void {
    try {
        packsStoreNotifier?.();
    } catch {
        // Ignore subscriber notification errors
    }
}

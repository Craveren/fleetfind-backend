import toast from 'react-hot-toast';

export async function tryBrowserNotify(title, body) {
    try {
        if (!('Notification' in window)) {
            toast.success(body || title);
            return;
        }
        if (Notification.permission === 'granted') {
            new Notification(title || 'Notification', { body: body || '' });
            return;
        }
        if (Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
                new Notification(title || 'Notification', { body: body || '' });
                return;
            }
        }
        toast.success(body || title);
    } catch {
        toast.success(body || title);
    }
}

export function notifyInApp(message) {
    toast.success(message);
}



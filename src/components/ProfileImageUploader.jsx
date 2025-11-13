import { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ImageIcon, Loader2Icon, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_HISTORY_KEY = 'profileAvatarHistory';

export default function ProfileImageUploader() {
    const { user, isLoaded } = useUser();
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [history, setHistory] = useState(() => {
        try {
            const raw = localStorage.getItem(AVATAR_HISTORY_KEY);
            return raw ? JSON.parse(raw)[user?.id] || [] : [];
        } catch {
            return [];
        }
    });

    const saveHistory = (url) => {
        try {
            const raw = localStorage.getItem(AVATAR_HISTORY_KEY);
            const map = raw ? JSON.parse(raw) : {};
            const list = map[user.id] || [];
            // keep last 6
            const next = [url, ...list.filter((u) => u !== url)].slice(0, 6);
            map[user.id] = next;
            localStorage.setItem(AVATAR_HISTORY_KEY, JSON.stringify(map));
            setHistory(next);
        } catch {
            // ignore
        }
    };

    const handlePick = () => inputRef.current?.click();

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !isLoaded || !user) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }
        setIsUploading(true);
        toast.loading('Uploading profile image...');
        try {
            // Save current image to history before replacing
            if (user.imageUrl) saveHistory(user.imageUrl);
            await user.setProfileImage({ file });
            await user.reload();
            toast.dismiss();
            toast.success('Profile image updated');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to update image');
            console.error(err);
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const revertTo = async (url) => {
        if (!url || !user) return;
        setIsUploading(true);
        toast.loading('Reverting image...');
        try {
            // Fetch and convert URL to Blob for Clerk API
            const res = await fetch(url, { mode: 'cors' });
            const blob = await res.blob();
            const file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
            await user.setProfileImage({ file });
            await user.reload();
            toast.dismiss();
            toast.success('Reverted profile image');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to revert image');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="elevated radius-card p-4 sm:p-5">
            <div className="flex items-center gap-4">
                <img
                    src={user?.imageUrl}
                    alt="Current avatar"
                    className="size-16 rounded-full object-cover border"
                    style={{ borderColor: 'var(--border)' }}
                />
                <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-zinc-300 mb-2">Update your profile picture</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePick}
                            className="radius-btn px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2Icon className="inline size-4 animate-spin" /> : <ImageIcon className="inline size-4 mr-1" />} Choose Image
                        </button>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFile}
                        />
                    </div>
                </div>
            </div>
            {history.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">Recent images</p>
                    <div className="flex flex-wrap gap-3">
                        {history.map((url, idx) => (
                            <button
                                key={`${url}-${idx}`}
                                type="button"
                                onClick={() => revertTo(url)}
                                className="relative group"
                                title="Revert to this image"
                            >
                                <img
                                    src={url}
                                    alt="Previous avatar"
                                    className="size-12 rounded-full object-cover border"
                                    style={{ borderColor: 'var(--border)' }}
                                />
                                <span className="absolute -right-1 -bottom-1 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border"
                                      style={{ borderColor: 'var(--border)', borderRadius: 10 }}>
                                    <RotateCcw className="size-3 m-1" />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}



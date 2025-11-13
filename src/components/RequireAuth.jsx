import { useUser, RedirectToSignIn } from '@clerk/clerk-react';

export default function RequireAuth({ children }) {
    const { isLoaded, isSignedIn } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200">
                Loading...
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return children;
}



import { SignInButton, useUser, useClerk } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Landing() {
    const { isSignedIn } = useUser() || {};
    const { signOut } = useClerk();
    const headlineRef = useRef(null);
    const sublineRef = useRef(null);
    const blobRef = useRef(null);
    const [firstVisit, setFirstVisit] = useState(false);
    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        // First-visit and returning visitor check using localStorage
        try {
            const visited = localStorage.getItem('hasVisited');
            if (!visited) {
                setFirstVisit(true);
                localStorage.setItem('hasVisited', 'true');
                localStorage.setItem('visitedAt', new Date().toISOString());
            } else {
                setHasVisited(true);
            }
        } catch {}

        const headline = headlineRef.current;
        const sub = sublineRef.current;
        const blob = blobRef.current;
        if (!headline || !sub || !blob) return;
        // Simple CSS-powered staged reveal
        requestAnimationFrame(() => {
            headline.classList.add('opacity-100', 'translate-y-0');
            setTimeout(() => sub.classList.add('opacity-100', 'translate-y-0'), 150);
            setTimeout(() => blob.classList.add('opacity-70', 'scale-100'), 300);
        });
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-[var(--bg)] dark:from-[var(--surface)] dark:to-[var(--bg)]">
            {(firstVisit || hasVisited) && (
                <div className="absolute inset-x-0 top-0 z-50">
                    <div className="mx-auto max-w-6xl px-6 py-2">
                        <div className="elevated radius-card p-3 text-sm text-zinc-700 dark:text-zinc-200">
                            {firstVisit
                                ? 'Welcome to TW Publishers — enjoy your first visit! You can always sign in to continue where you left off.'
                                : 'Welcome back to TW Publishers — pick up right where you left off.'}
                        </div>
                    </div>
                </div>
            )}
            {/* Animated blob */}
            <div
                ref={blobRef}
                className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.35),transparent_60%)] blur-3xl opacity-0 scale-75 transition-all duration-[1200ms]"
            />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.35),transparent_60%)] blur-3xl opacity-60" />

            {/* Simple nav */}
            <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-md bg-blue-600" />
                    <span className="font-semibold text-zinc-900 dark:text-white">TW Publishers</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/book-catalog" className="text-sm text-zinc-700 dark:text-zinc-300 hover:underline">Explore</Link>
                    {isSignedIn ? (
                        <div className="flex items-center gap-2">
                            <Link to="/" className="px-4 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Go to app
                            </Link>
                            <button onClick={() => signOut(() => window.location.assign('/landing'))} className="px-4 py-2 text-sm rounded-md bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 hover:opacity-90">
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:opacity-90">
                                Sign in
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
                <h1
                    ref={headlineRef}
                    className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white opacity-0 translate-y-4 transition-all duration-700"
                >
                    Publish smarter. Collaborate faster.
                </h1>
                <p
                    ref={sublineRef}
                    className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 opacity-0 translate-y-4 transition-all duration-700"
                >
                    A streamlined workspace for authors and editors to plan, track, and launch books—with
                    analytics, royalties, and campaigns in one place.
                </p>

                <div className="mt-8 flex items-center gap-3">
                    {isSignedIn ? (
                        <>
                            <Link to="/" className="px-5 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:opacity-90">
                                Open your workspace
                            </Link>
                            <button onClick={() => signOut(() => window.location.assign('/landing'))} className="px-5 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <button className="px-5 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:opacity-90">
                                    Get started — Sign in
                                </button>
                            </SignInButton>
                            <Link to="/book-catalog" className="px-5 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                View catalog
                            </Link>
                        </>
                    )}
                </div>

                {/* Feature cards */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { title: 'Plan & track', desc: 'Stages, tasks, due dates—all aligned to your launch.' },
                        { title: 'Collaborate', desc: 'Assign roles, comment, and keep teams in sync.' },
                        { title: 'Grow revenue', desc: 'Royalties and sales analytics at a glance.' },
                    ].map((f, i) => (
                        <div key={i} className="elevated radius-card p-6">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">{f.title}</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}



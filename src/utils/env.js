// Utility helpers to safely read environment variables across Vite and CRA-style builds
// Prefer Vite `import.meta.env.VITE_*`, but also support `process.env.REACT_APP_*` fallbacks.
export function getEnvValue(possibleKeys = []) {
    for (const key of possibleKeys) {
        // Vite style
        if (typeof import.meta !== 'undefined' && import.meta.env && Object.prototype.hasOwnProperty.call(import.meta.env, key)) {
            const value = String(import.meta.env[key] ?? '').trim();
            if (value) return value;
        }
        // CRA / Node style
        if (typeof process !== 'undefined' && process.env && Object.prototype.hasOwnProperty.call(process.env, key)) {
            const value = String(process.env[key] ?? '').trim();
            if (value) return value;
        }
    }
    return undefined;
}

export function getClerkPublishableKey() {
    return getEnvValue([
        'VITE_CLERK_PUBLISHABLE_KEY',
        'VITE_PUBLISHABLE_KEY',
        'REACT_APP_CLERK_PUBLISHABLE_KEY',
        'REACT_APP_PUBLISHABLE_KEY',
        'CLERK_PUBLISHABLE_KEY', // last resort if injected at runtime
        'PUBLISHABLE_KEY',
    ]);
}



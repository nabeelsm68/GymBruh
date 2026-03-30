'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * User-scoped localStorage utility.
 * Provides a userId prefix so each account gets isolated data.
 */

let cachedUserId: string | null = null;

/**
 * Synchronously returns the cached user ID, or 'guest' if not yet fetched.
 * Call initUserId() first in a useEffect to populate the cache.
 */
export function getUserId(): string {
    return cachedUserId || 'guest';
}

/**
 * Async function to fetch and cache the user ID from Supabase.
 * Should be called once per page in a useEffect.
 * Returns the user ID string.
 */
export async function initUserId(): Promise<string> {
    if (cachedUserId) return cachedUserId;

    const isGuest = typeof document !== 'undefined' && document.cookie.includes('gymbruh-guest=true');
    if (isGuest) {
        cachedUserId = 'guest';
        return 'guest';
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        cachedUserId = user?.id || 'guest';
    } catch {
        cachedUserId = 'guest';
    }

    return cachedUserId;
}

/**
 * Build a user-scoped localStorage key.
 * Example: userKey('sleep-2026-03-09') => 'gymbruh-abc123-sleep-2026-03-09'
 */
export function userKey(base: string): string {
    return `gymbruh-${getUserId()}-${base}`;
}

/**
 * Reset cached user ID (call on sign-out).
 */
export function resetUserIdCache(): void {
    cachedUserId = null;
}

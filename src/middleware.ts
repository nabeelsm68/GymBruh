import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    const isGuest = request.cookies.get('gymbruh-guest')?.value === 'true';

    const protectedRoutes = ['/dashboard', '/onboarding'];
    const isProtected = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (isGuest && isProtected) {
        // Guest can access everything
        return NextResponse.next();
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

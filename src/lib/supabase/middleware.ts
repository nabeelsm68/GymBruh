import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();

    const isGuest = request.cookies.get('gymbruh-guest')?.value === 'true';
    const protectedRoutes = ['/dashboard', '/onboarding'];
    const isProtected = protectedRoutes.some((route) =>
        url.pathname.startsWith(route)
    );

    if (!user && !isGuest && isProtected) {
        // Redirect unauthenticated, non-guest users to login
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

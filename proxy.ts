import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = new URL(request.url);
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/chat', request.url));
    }
    // return NextResponse.redirect(new URL('/chat', request.url));
};
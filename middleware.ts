import { NextRequest, NextResponse } from 'next/server'
import { readServiceNotice } from './src/services/serviceNotice/readServiceNotice'

/**
 * When this environment's service notice is in `block` mode, patients arriving
 * at a session or a hosted pages link get the unavailable page instead. It
 * makes no orchestration calls, so it renders while orchestration is down. The
 * URL is kept, so a reload after the notice is switched off resumes the session.
 */
export async function middleware(request: NextRequest) {
  const notice = await readServiceNotice()
  if (notice.mode !== 'block') return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/unavailable'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/', '/c/:path*', '/l/:path*'],
}

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || request.headers.get('authorization') || ''
    const backendUrl = `${API_URL}/assignments/submissions/`
    
    if (process.env.NODE_ENV === 'development') { console.log('[Proxy] Forwarding to backend:', backendUrl) }
    
    // Parse search params from request
    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    const backendRequestUrl = new URL(backendUrl)
    Object.entries(searchParams).forEach(([key, value]) => backendRequestUrl.searchParams.set(key, value))
    
    const backendResponse = await fetch(backendRequestUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...Object.fromEntries(request.headers.entries())
      },
    })

    if (!backendResponse.ok) {
      if (process.env.NODE_ENV === 'development') { console.error('[Proxy] Backend error:', backendResponse.status, backendResponse.statusText) }
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(errorData, {
        status: backendResponse.status,
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') { console.error('[Proxy] Fetch error:', error) }
    return NextResponse.json(
      { detail: 'Proxy error', error: (error as Error).message },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } }
    )
  }
}

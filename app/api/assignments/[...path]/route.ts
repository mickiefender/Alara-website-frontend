import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const backendPath = `/api/${path.join('/')}`
    const backendUrl = `${API_URL}${backendPath}`
    
    const token = request.cookies.get('authToken')?.value || request.headers.get('authorization') || ''
    
    if (process.env.NODE_ENV === 'development') { console.log('[Catch-all Proxy] Forwarding to:', backendUrl) }
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...Object.fromEntries(request.headers.entries())
      },
      cache: 'no-store'
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        await backendResponse.json(),
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') { console.error('[Proxy Error]:', error) }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


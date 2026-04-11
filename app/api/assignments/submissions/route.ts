import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || request.headers.get('authorization') || ''
    const backendUrl = `${API_URL}/assignments/submissions/`
    
    console.log('[Proxy] Forwarding to backend:', backendUrl)
    
    // Parse search params from request
    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...Object.fromEntries(request.headers.entries())
      },
      ...(Object.keys(searchParams).length > 0 && { searchParams })
    })

    if (!backendResponse.ok) {
      console.error('[Proxy] Backend error:', backendResponse.status, backendResponse.statusText)
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(errorData, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Proxy] Fetch error:', error)
    return NextResponse.json(
      { detail: 'Proxy error', error: (error as Error).message },
      { status: 500 }
    )
  }
}


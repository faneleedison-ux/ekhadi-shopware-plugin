import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToOBS } from '@/lib/obs'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  if (bytes.byteLength > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const folder = formData.get('folder') ?? 'uploads'
  const key = `${folder}/${session.user.id}/${Date.now()}.${ext}`

  try {
    const url = await uploadToOBS(key, Buffer.from(bytes), file.type)
    return NextResponse.json({ url, key })
  } catch (err: any) {
    console.error('[OBS upload]', err)
    return NextResponse.json({ error: 'Upload failed — OBS not configured' }, { status: 503 })
  }
}
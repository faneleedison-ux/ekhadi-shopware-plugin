import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { hash } from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  const VALID_ROLES = ['ADMIN', 'MEMBER', 'SHOP']
  if (role && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role value' }, { status: 400 })
  }

  const users = await prisma.user.findMany({
    where: role ? { role: role as 'ADMIN' | 'MEMBER' | 'SHOP' } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role, phone, sassaId, shopName, areaId } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password and role are required' },
        { status: 400 }
      )
    }

    const VALID_ROLES = ['ADMIN', 'MEMBER', 'SHOP']
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          passwordHash,
          role,
          phone: phone || null,
        },
      })

      // Create role-specific records
      if (role === 'MEMBER') {
        if (!sassaId) {
          throw new Error('SASSA ID is required for members')
        }

        const defaultArea = areaId
          ? await tx.area.findUnique({ where: { id: areaId } })
          : await tx.area.findFirst()

        if (!defaultArea) {
          throw new Error('No area found. An area must exist before members can register.')
        }

        await tx.customerProfile.create({
          data: {
            userId: newUser.id,
            sassaId,
            areaId: defaultArea.id,
            creditScore: 50,
            monthlyGrantAmount: 350,
            isActive: true,
          },
        })

        // Create store credit wallet
        await tx.storeCredit.create({
          data: {
            userId: newUser.id,
            balance: 0,
          },
        })
      }

      if (role === 'SHOP') {
        if (!shopName) {
          throw new Error('Shop name is required for shop owners')
        }

        const defaultArea = areaId
          ? await tx.area.findUnique({ where: { id: areaId } })
          : await tx.area.findFirst()

        if (!defaultArea) {
          throw new Error('A valid area is required for shop owners')
        }

        await tx.shop.create({
          data: {
            name: shopName.trim(),
            userId: newUser.id,
            areaId: defaultArea.id,
            isActive: true,
          },
        })
      }

      return newUser
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}

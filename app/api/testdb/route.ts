// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query successful:', result)
    
    const userCount = await prisma.user.count()
    console.log('📊 User count:', userCount)
    
    return NextResponse.json({ 
      success: true, 
      connected: true,
      userCount,
      result 
    })
  } catch (error: any) {
    console.error('💥 Database test failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      name: error.name,
      code: error.code
    }, { status: 500 })
  }
}
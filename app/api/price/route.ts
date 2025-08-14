import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const latestPrice = await prisma.price.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  
  return NextResponse.json({
    price: latestPrice?.price?.toFixed(2) || "0.00",
    change: latestPrice?.change?.toFixed(2) || "0.00"
  });
}
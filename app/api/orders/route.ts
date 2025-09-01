import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const createOrderSchema = z.object({
  items: z.array(z.object({
    listingId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  buyerInfo: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  totalAmount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);
    
    // For POC, create a dummy buyer if not exists
    // First try to find by email
    let buyer = await prisma.user.findUnique({
      where: { email: data.buyerInfo.email },
    });
    
    if (buyer) {
      // Update existing user (but don't update phone if it would conflict)
      const phoneExists = await prisma.user.findUnique({
        where: { phone: data.buyerInfo.phone },
      });
      
      buyer = await prisma.user.update({
        where: { id: buyer.id },
        data: {
          name: data.buyerInfo.fullName,
          // Only update phone if it's not taken by another user
          phone: (!phoneExists || phoneExists.id === buyer.id) ? data.buyerInfo.phone : buyer.phone,
        },
      });
    } else {
      // Check if phone is already taken
      const phoneExists = await prisma.user.findUnique({
        where: { phone: data.buyerInfo.phone },
      });
      
      // Create new user with unique phone or null
      buyer = await prisma.user.create({
        data: {
          email: data.buyerInfo.email,
          name: data.buyerInfo.fullName,
          phone: phoneExists ? null : data.buyerInfo.phone,
          role: 'BUYER',
        },
      });
    }
    
    // Create the order with items
    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        total: data.totalAmount,
        status: OrderStatus.PENDING,
        address: `${data.buyerInfo.addressLine1}${data.buyerInfo.addressLine2 ? ', ' + data.buyerInfo.addressLine2 : ''}, ${data.buyerInfo.city}${data.buyerInfo.postalCode ? ' ' + data.buyerInfo.postalCode : ''}`,
        items: {
          create: data.items.map(item => ({
            listingId: item.listingId,
            qty: item.quantity,
            priceSar: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid order data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const buyerId = searchParams.get('buyerId');
    
    if (!buyerId) {
      return NextResponse.json(
        { error: 'Buyer ID is required' },
        { status: 400 }
      );
    }
    
    const orders = await prisma.order.findMany({
      where: { buyerId },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
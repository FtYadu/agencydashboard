import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { invoiceSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await db.invoice.findMany({
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = invoiceSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User not associated with an organization' },
        { status: 400 }
      );
    }

    // Calculate amounts
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const tax = validatedData.tax || 0;
    const discount = validatedData.discount || 0;
    const total = subtotal + tax - discount;

    // Generate invoice number if not provided
    const latestInvoice = await db.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}-${String((latestInvoice ? parseInt(latestInvoice.invoiceNumber.split('-')[2]) + 1 : 1)).padStart(4, '0')}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientId: validatedData.clientId,
        issueDate: validatedData.issueDate,
        dueDate: validatedData.dueDate,
        subtotal,
        tax,
        discount,
        total,
        notes: validatedData.notes,
        terms: validatedData.terms,
        organizationId: user.organizationId,
        status: 'DRAFT',
        items: {
          create: validatedData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

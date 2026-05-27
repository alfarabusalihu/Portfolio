import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        const doc = await db.collection('portfolio').findOne({ _type: 'projects' });
        return NextResponse.json(doc?.data ?? []);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const doc = await db.collection('portfolio').findOne({ _type: 'highfives' });
        return NextResponse.json({ count: doc?.count ?? 0 });
    } catch (e: unknown) {
        console.error('[highfive GET]', (e as Error).message);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}

export async function POST() {
    try {
        const db = await getDb();
        await db.collection('portfolio').updateOne(
            { _type: 'highfives' },
            { $inc: { count: 1 } },
            { upsert: true }
        );
        // Read back the updated count
        const doc = await db.collection('portfolio').findOne({ _type: 'highfives' });
        return NextResponse.json({ count: doc?.count ?? 1 });
    } catch (e: unknown) {
        console.error('[highfive POST]', (e as Error).message);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}

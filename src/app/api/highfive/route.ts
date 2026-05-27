import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
    try {
        const db = await getDb();

        // Daily dedup — hash the IP + today's date to prevent multiple counts per day
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const dedupKey = `${ip}::${today}`;

        // Check if this IP already high-fived today
        const existing = await db.collection('highfive_dedup').findOne({ key: dedupKey });
        if (existing) {
            // Already counted today — return current count without incrementing
            const doc = await db.collection('portfolio').findOne({ _type: 'highfives' });
            return NextResponse.json({ count: doc?.count ?? 0 });
        }

        // Record the dedup entry with a TTL index (auto-expires after 24h)
        await db.collection('highfive_dedup').insertOne({
            key: dedupKey,
            createdAt: new Date(),
        });

        // Increment the count
        await db.collection('portfolio').updateOne(
            { _type: 'highfives' },
            { $inc: { count: 1 } },
            { upsert: true }
        );

        const doc = await db.collection('portfolio').findOne({ _type: 'highfives' });
        return NextResponse.json({ count: doc?.count ?? 1 });
    } catch (e: unknown) {
        console.error('[highfive POST]', (e as Error).message);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}

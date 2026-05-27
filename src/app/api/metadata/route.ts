import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDb();
        const doc = await db.collection('portfolio').findOne({ _type: 'metadata' });
        return NextResponse.json(doc?.data ?? { cvFileId: '', imgFileId: '', lastSync: '' });
    } catch {
        return NextResponse.json({ cvFileId: '', imgFileId: '', lastSync: '' }, { status: 500 });
    }
}

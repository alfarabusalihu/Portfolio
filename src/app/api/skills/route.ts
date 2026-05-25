import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const doc = await db.collection('portfolio').findOne({ _type: 'skills' });
        const raw = doc?.data ?? { stacks: [], tools: [] };
        // Only expose stacks + tools — strip any extra keys the AI may have added
        return NextResponse.json({
            stacks: raw.stacks ?? [],
            tools: raw.tools ?? [],
        });
    } catch {
        return NextResponse.json({ stacks: [], tools: [] }, { status: 500 });
    }
}

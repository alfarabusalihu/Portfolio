import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const doc = await db.collection('assets').findOne({ fileName: 'cv.pdf' });
        if (!doc?.data) {
            return new NextResponse('CV not found', { status: 404 });
        }
        // data is stored as Binary — convert to Buffer
        const buffer = Buffer.isBuffer(doc.data)
            ? doc.data
            : Buffer.from(doc.data.buffer ?? doc.data);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="cv.pdf"',
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch {
        return new NextResponse('Error fetching CV', { status: 500 });
    }
}

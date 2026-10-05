import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return new NextResponse('Database unavailable', { status: 503 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data, error } = await supabase.storage
            .from('portfolio')
            .download('cv.pdf');

        if (error) {
            console.error('CV fetch error:', error.message);
            return new NextResponse('CV not found', { status: 404 });
        }

        return new NextResponse(data, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="cv.pdf"',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('CV fetch error:', error);
        return new NextResponse('Error fetching CV', { status: 500 });
    }
}

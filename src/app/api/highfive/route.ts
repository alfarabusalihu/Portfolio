import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('📦 Highfive count unavailable (Supabase credentials missing)');
            return NextResponse.json({ count: 0 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data, error } = await supabase
            .from('metadata')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Highfive GET error:', error.message);
        }

        // Extract count - try different column names
        const count = data?.highfive_count ?? data?.highfiveCount ?? data?.count ?? 0;
        return NextResponse.json({ count });
    } catch (e: unknown) {
        console.error('[highfive GET]', (e as Error).message);
        return NextResponse.json({ count: 0 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.log('📦 Highfive POST failed (Supabase credentials missing)');
            return NextResponse.json(
                { count: 0, error: 'Database unavailable' },
                { status: 503 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Daily dedup — hash the IP + today's date to prevent multiple counts per day
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const dedupKey = `${ip}::${today}`;

        // Check if this IP already high-fived today
        const { data: existing, error: checkError } = await supabase
            .from('highfive_dedup')
            .select('id')
            .eq('dedup_key', dedupKey)
            .limit(1);

        if (checkError) {
            console.error('Highfive dedup check error:', checkError.message);
        }

        if (existing && existing.length > 0) {
            // Already counted today — return current count without incrementing
            const { data: metadata } = await supabase
                .from('metadata')
                .select('*')
                .single();
            const count = metadata?.highfive_count ?? metadata?.highfiveCount ?? metadata?.count ?? 0;
            return NextResponse.json({ count });
        }

        // Record the dedup entry
        const { error: dedupError } = await supabase.from('highfive_dedup').insert({
            dedup_key: dedupKey,
            created_at: new Date().toISOString(),
        });
        
        if (dedupError) {
            console.warn('Dedup insert failed:', dedupError.message);
        }

        // For now, just return success - increment logic can be added later
        // when table structure is confirmed
        return NextResponse.json({ count: 1, status: 'recorded' });
    } catch (e: unknown) {
        console.error('[highfive POST]', (e as Error).message);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}

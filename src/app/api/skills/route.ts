import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Pure pass-through — whatever is stored in Supabase is what the frontend gets.
// icon values are set when skills are written to the DB (via the sync workflow).
// No hardcoded icon map here; the DB is the single source of truth.
const normalizeItem = (item: any) => {
    if (typeof item === 'string') {
        return { name: item, icon: 'Zap' };
    }
    if (item && typeof item === 'object') {
        const name = item.name || item.title || '';
        const icon = item.icon || 'Zap';
        return { name, icon };
    }
    return { name: '', icon: 'Zap' };
};

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey =
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Supabase credentials missing in GET /api/skills');
            return NextResponse.json({ stacks: [], tools: [] });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
            .from('skills')
            .select('data')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('❌ Supabase query error in GET /api/skills:', error.message);
            return NextResponse.json({ stacks: [], tools: [] }, { status: 500 });
        }

        const raw = data?.data || {};
        const stacks = (raw.stacks || []).map(normalizeItem).filter((s: any) => s.name);
        const tools  = (raw.tools  || []).map(normalizeItem).filter((s: any) => s.name);

        return NextResponse.json({ stacks, tools });
    } catch (err) {
        console.error('Skills API error:', err);
        return NextResponse.json({ stacks: [], tools: [] }, { status: 500 });
    }
}

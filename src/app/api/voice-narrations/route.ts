import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('⚠️  Supabase credentials missing');
            return NextResponse.json({ narrations: {} });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Query database for voice narrations
        console.log('📖 Querying voice_narrations table...');
        const { data, error } = await supabase
            .from('voice_narrations')
            .select('project_title, audio_url')
            .order('generated_at', { ascending: false });

        if (error) {
            console.error('❌ Database query error:', error.message);
            return NextResponse.json({ narrations: {} });
        }

        // Transform to map: project_title → audio_url
        const narrationMap: Record<string, string> = {};
        if (data && data.length > 0) {
            console.log(`✅ Found ${data.length} voice narrations in database`);
            data.forEach((row: any) => {
                if (row.project_title && row.audio_url) {
                    narrationMap[row.project_title] = row.audio_url;
                    console.log(`   ✅ ${row.project_title}`);
                }
            });
        } else {
            console.log('📦 No voice narrations in database');
        }

        return NextResponse.json({ narrations: narrationMap });

    } catch (error) {
        console.error('Voice narrations API error:', error);
        return NextResponse.json({ narrations: {} });
    }
}

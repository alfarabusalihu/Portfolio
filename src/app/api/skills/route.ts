import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fallbackSkills from '@/data/generated-skills.json';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('📦 Using fallback skills data (Supabase credentials missing)');
            return NextResponse.json(fallbackSkills);
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data, error } = await supabase
            .from('skills')
            .select('data')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.log('📦 Using fallback skills data (Supabase query error):', error.message);
            return NextResponse.json(fallbackSkills);
        }

        // Return skills data or fallback if empty
        if (!data?.data) {
            console.log('📦 Using fallback skills data (no Supabase data)');
            return NextResponse.json(fallbackSkills);
        }

        const raw = data.data;
        // Only expose stacks + tools — strip any extra keys the AI may have added
        return NextResponse.json({
            stacks: raw.stacks ?? [],
            tools: raw.tools ?? [],
        });
    } catch (error) {
        console.error('Skills API error:', error);
        console.log('📦 Using fallback skills data (error)');
        return NextResponse.json(fallbackSkills);
    }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fallbackProjects from '@/data/projects.json';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('📦 Using fallback projects data (Supabase credentials missing)');
            return NextResponse.json(fallbackProjects);
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Try without orderBy first in case column doesn't exist
        const { data, error } = await supabase
            .from('projects')
            .select('*');

        if (error) {
            console.log('📦 Using fallback projects data (Supabase query error):', error.message);
            return NextResponse.json(fallbackProjects);
        }

        // Return projects or fallback if empty
        return NextResponse.json(data && data.length > 0 ? data : fallbackProjects);
    } catch (error) {
        console.error('Projects API error:', error);
        console.log('📦 Using fallback projects data (error)');
        return NextResponse.json(fallbackProjects);
    }
}

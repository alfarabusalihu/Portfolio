import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const fallbackMetadata = {
    cvFileId: '',
    cvModifiedTime: '',
    imgFileId: '',
    lastSync: '',
};

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('📦 Using fallback metadata (Supabase credentials missing)');
            return NextResponse.json(fallbackMetadata);
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
            .from('metadata')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.log('📦 Using fallback metadata (Supabase query error):', error.message);
            return NextResponse.json(fallbackMetadata);
        }

        return NextResponse.json(data || fallbackMetadata);
    } catch (error) {
        console.error('Metadata API error:', error);
        return NextResponse.json(fallbackMetadata);
    }
}

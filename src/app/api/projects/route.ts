import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Supabase credentials missing in GET /api/projects');
            return NextResponse.json([]);
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data, error } = await supabase
            .from('projects')
            .select('*');

        if (error) {
            console.error('❌ Supabase error in GET /api/projects:', error.message);
            return NextResponse.json([], { status: 500 });
        }

        // Map DB records directly from database
        const projects = (data || []).map((item: any) => {
            const websiteLink = item.websiteLink || item.websitelink || item.website_link || null;
            return {
                title: item.title || '',
                description: item.description || '',
                image: item.image || item.img || '',
                link: item.link || '',
                websiteLink: websiteLink,
                tags: Array.isArray(item.tags) ? item.tags : [],
                isAutoSync: item.isAutoSync ?? item.isautosync ?? item.is_auto_sync ?? false,
                isPrivate: item.isPrivate ?? item.isprivate ?? item.is_private ?? false,
            };
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Projects API error:', error);
        return NextResponse.json([], { status: 500 });
    }
}

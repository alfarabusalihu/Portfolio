import type { Project } from '../../interfaces';

/**
 * Sorts projects to prioritize items with live website links first.
 */
export const sortProjects = (data: Project[]): Project[] => 
    [...data].sort((a, b) => {
        if (a.websiteLink && !b.websiteLink) return -1;
        if (!a.websiteLink && b.websiteLink) return 1;
        return 0;
    });

/**
 * Converts a project title into its corresponding Supabase Storage voice narration URL.
 */
export const getAudioUrl = (projectTitle: string): string => {
    const filename = projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://griiqbdbjrscgwlxlngu.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/voice-narration/${filename}.mp3`;
};

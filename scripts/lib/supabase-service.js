/**
 * Supabase Service
 * PostgreSQL database client for portfolio data
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials missing. Check .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role (for backend operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

class SupabaseService {
    /**
     * Test connection to Supabase
     */
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('metadata')
                .select('id')
                .limit(1);

            if (error) throw error;
            return { success: true, message: 'Connected to Supabase' };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    /**
     * Get all projects
     */
    async getProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Create or update project
     */
    async upsertProject(project) {
        const { data, error } = await supabase
            .from('projects')
            .upsert(
                {
                    ...project,
                    updated_at: new Date(),
                },
                { onConflict: 'link' }
            )
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Delete all projects and insert new ones
     */
    async replaceAllProjects(projects) {
        // Delete all existing
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .gt('id', 0);

        if (deleteError) throw deleteError;

        // Insert new ones
        const { data, error: insertError } = await supabase
            .from('projects')
            .insert(projects.map(p => ({ ...p, created_at: new Date() })))
            .select();

        if (insertError) throw insertError;
        return data;
    }

    /**
     * Get skills data
     */
    async getSkills() {
        const { data, error } = await supabase
            .from('skills')
            .select('data')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.data || [];
    }

    /**
     * Save/update skills
     */
    async saveSkills(skillsData) {
        const existing = await supabase
            .from('skills')
            .select('id')
            .limit(1);

        if (existing.data && existing.data.length > 0) {
            // Update existing
            const { data, error } = await supabase
                .from('skills')
                .update({ data: skillsData, updated_at: new Date() })
                .eq('id', existing.data[0].id)
                .select();

            if (error) throw error;
            return data[0];
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('skills')
                .insert([{ data: skillsData, created_at: new Date() }])
                .select();

            if (error) throw error;
            return data[0];
        }
    }

    /**
     * Get metadata
     */
    async getMetadata() {
        const { data, error } = await supabase
            .from('metadata')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || {};
    }

    /**
     * Update metadata
     */
    async updateMetadata(metadata) {
        const existing = await this.getMetadata();

        if (existing.id) {
            // Update existing
            const { data, error } = await supabase
                .from('metadata')
                .update({ ...metadata, updated_at: new Date() })
                .eq('id', existing.id)
                .select();

            if (error) throw error;
            return data[0];
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('metadata')
                .insert([{ ...metadata, created_at: new Date() }])
                .select();

            if (error) throw error;
            return data[0];
        }
    }

    /**
     * Upload file to storage
     */
    async uploadFile(bucket, path, file) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true });

        if (error) throw error;
        return data;
    }

    /**
     * Get public URL for stored file
     */
    getPublicUrl(bucket, path) {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    /**
     * Get all voice narrations
     */
    async getVoiceNarrations() {
        const { data, error } = await supabase
            .from('voice_narrations')
            .select('*')
            .order('generated_at', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error; // 116 = no rows
        return data || [];
    }

    /**
     * Save/update voice narration
     */
    async saveVoiceNarration(narration) {
        const { data, error } = await supabase
            .from('voice_narrations')
            .upsert({
                ...narration,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'project_title' })
            .select();

        if (error) throw error;
        return data[0];
    }
}

module.exports = new SupabaseService();

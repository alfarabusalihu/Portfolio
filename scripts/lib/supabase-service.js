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
     * Get exact schema columns for projects table
     */
    async getProjectsSchema() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (error && error.code !== 'PGRST116') {
            console.error('Schema check error:', error);
            return null;
        }
        
        // Return column names from first row or empty object
        return data && data.length > 0 ? Object.keys(data[0]) : null;
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

        // Get a sample row to understand the exact schema
        const { data: sampleData } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        // Determine which fields the table actually has
        const schemaFields = sampleData && sampleData.length > 0 
            ? Object.keys(sampleData[0]) 
            : ['id', 'title', 'link', 'description', 'tags']; // fallback to known fields

        console.log('📋 Projects table schema:', schemaFields.join(', '));

        // Map projects to only include fields that exist in schema
        const safeProjects = projects.map(p => {
            const safe = {
                title: p.title,
                link: p.link,
                description: p.description,
                tags: p.tags || [],
            };
            
            // Only add optional fields if they exist in schema
            const wLink = p.websiteLink || p.websitelink || p.website_link || null;
            if (schemaFields.includes('websiteLink')) safe.websiteLink = wLink;
            if (schemaFields.includes('website_link')) safe.website_link = wLink;
            if (schemaFields.includes('websitelink')) safe.websitelink = wLink;
            if (schemaFields.includes('image')) safe.image = p.image || null;
            if (schemaFields.includes('isAutoSync')) safe.isAutoSync = true;
            if (schemaFields.includes('is_auto_sync')) safe.is_auto_sync = true;
            if (schemaFields.includes('isautosync')) safe.isautosync = true;
            if (schemaFields.includes('isPrivate')) safe.isPrivate = p.isPrivate || false;
            if (schemaFields.includes('is_private')) safe.is_private = p.isPrivate || false;
            if (schemaFields.includes('isprivate')) safe.isprivate = p.isPrivate || false;
            
            return safe;
        });

        const { data, error: insertError } = await supabase
            .from('projects')
            .insert(safeProjects)
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
                .update({ data: skillsData })
                .eq('id', existing.data[0].id)
                .select();

            if (error) throw error;
            return data[0];
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('skills')
                .insert([{ data: skillsData }])
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
                .update({ ...metadata, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select();

            if (error) throw error;
            return data[0];
        } else {
            // Insert new (without created_at if column doesn't exist)
            const { data, error } = await supabase
                .from('metadata')
                .insert([metadata])
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
     * Check if voice narration exists for a project (case-insensitive)
     */
    async voiceNarrationExists(projectTitle) {
        console.log(`[DB Query] Checking if voice narration exists for: "${projectTitle}"`);
        
        // Use ilike for case-insensitive match
        const { data, error } = await supabase
            .from('voice_narrations')
            .select('*')
            .ilike('project_title', projectTitle)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error(`[DB Query] Error:`, error);
            throw error;
        }
        
        console.log(`[DB Query] Result:`, data ? `✓ Found (${data.project_title})` : '✗ Not found');
        return data;
    }

    /**
     * Save/update voice narration
     */
    async saveVoiceNarration(narration) {
        const { data, error } = await supabase
            .from('voice_narrations')
            .upsert({
                project_title: narration.project_title,
                script: narration.script,
                audio_url: narration.audio_url,
                readme_hash: narration.readme_hash || null,
                generated_at: narration.generated_at,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'project_title' })
            .select();

        if (error) throw error;
        return data[0];
    }
}

module.exports = new SupabaseService();

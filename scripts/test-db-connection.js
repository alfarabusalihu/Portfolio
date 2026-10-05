#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * Verifies all tables exist and are accessible
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Missing credentials:');
    console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗ NOT SET');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗ NOT SET');
    console.error('\n📝 Add these to .env file\n');
    process.exit(1);
}

console.log('\n🔗 Testing Supabase Connection...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
    try {
        // Test 1: Connection
        console.log('1️⃣  Testing connection...');
        const { data: pingData, error: pingError } = await supabase
            .from('voice_narrations')
            .select('id')
            .limit(1);

        if (pingError && pingError.code !== 'PGRST116') {
            throw new Error(`Connection failed: ${pingError.message}`);
        }
        console.log('   ✅ Connected to Supabase\n');

        // Test 2: Projects table
        console.log('2️⃣  Checking projects table...');
        const { data: projects, error: projectsError, count: projectsCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact' });

        if (projectsError && projectsError.code !== 'PGRST116') {
            throw new Error(`Projects query failed: ${projectsError.message}`);
        }
        console.log(`   ✅ Projects table: ${projects?.length || 0} entries\n`);

        // Test 3: Skills table
        console.log('3️⃣  Checking skills table...');
        const { data: skills, error: skillsError } = await supabase
            .from('skills')
            .select('*');

        if (skillsError && skillsError.code !== 'PGRST116') {
            throw new Error(`Skills query failed: ${skillsError.message}`);
        }
        console.log(`   ✅ Skills table: ${skills?.length || 0} entries\n`);

        // Test 4: Voice narrations table
        console.log('4️⃣  Checking voice_narrations table...');
        const { data: narrations, error: narrationsError } = await supabase
            .from('voice_narrations')
            .select('*');

        if (narrationsError && narrationsError.code !== 'PGRST116') {
            throw new Error(`Voice narrations query failed: ${narrationsError.message}`);
        }
        console.log(`   ✅ Voice narrations table: ${narrations?.length || 0} entries`);
        
        if (narrations && narrations.length > 0) {
            console.log('\n   📋 Available narrations:');
            narrations.forEach(n => {
                console.log(`      • ${n.project_title}`);
            });
        }
        console.log();

        // Test 5: Metadata table
        console.log('5️⃣  Checking metadata table...');
        const { data: metadata, error: metadataError } = await supabase
            .from('metadata')
            .select('*');

        if (metadataError && metadataError.code !== 'PGRST116') {
            throw new Error(`Metadata query failed: ${metadataError.message}`);
        }
        console.log(`   ✅ Metadata table: ${metadata?.length || 0} entries\n`);

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 DATABASE STATUS\n');
        console.log(`   Projects:        ${projects?.length || 0}/9 ${projects?.length === 9 ? '✅' : '⚠️'}`);
        console.log(`   Skills:          ${skills?.length || 0}/1 ${skills?.length === 1 ? '✅' : '⚠️'}`);
        console.log(`   Voice narrations: ${narrations?.length || 0}/9 ${narrations?.length === 9 ? '✅' : '⚠️'}`);
        console.log(`   Metadata:        ${metadata?.length || 0}/1 ${metadata?.length === 1 ? '✅' : '⚠️'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const allPopulated = 
            projects?.length === 9 && 
            skills?.length === 1 && 
            narrations?.length === 9 && 
            metadata?.length >= 1;

        if (allPopulated) {
            console.log('✅ Database fully populated! Ready to test.\n');
            return 0;
        } else {
            console.log('⚠️  Database not fully populated.\n');
            console.log('Next steps:');
            if (projects?.length === 0) console.log('   1. Run: node scripts/populate-voice-narrations.js');
            if (skills?.length === 0) console.log('   2. Run SQL: POPULATE_DATABASE.sql');
            console.log('\n');
            return 1;
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message, '\n');
        process.exit(1);
    }
}

testConnection().then(code => process.exit(code));

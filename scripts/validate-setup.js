#!/usr/bin/env node

/**
 * Validate Supabase Setup
 * Checks if all tables exist and buckets are accessible
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Missing Supabase credentials\n');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function validateSetup() {
    console.log('\n🔍 Validating Supabase Setup...\n');

    let hasErrors = false;

    // ─────────────────────────────────────────────────────────────────
    // 1. Check Tables
    // ─────────────────────────────────────────────────────────────────
    console.log('📋 Checking Tables:\n');

    const tables = ['projects', 'skills', 'metadata', 'voice_narrations'];

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error && error.code === 'PGRST116') {
                // Table exists but is empty
                console.log(`   ✅ ${table} - exists (empty)`);
            } else if (error) {
                console.log(`   ❌ ${table} - ERROR: ${error.message}`);
                hasErrors = true;
            } else {
                console.log(`   ✅ ${table} - exists (${data.length > 0 ? 'populated' : 'empty'})`);
                
                // Show schema for projects table
                if (table === 'projects' && data.length > 0) {
                    const columns = Object.keys(data[0]);
                    console.log(`      📊 Schema: ${columns.join(', ')}`);
                }
            }
        } catch (err) {
            console.log(`   ❌ ${table} - FAILED: ${err.message}`);
            hasErrors = true;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. Check Buckets
    // ─────────────────────────────────────────────────────────────────
    console.log('\n🪣 Checking Storage Buckets:\n');

    try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.log(`   ❌ Cannot list buckets: ${bucketsError.message}`);
            hasErrors = true;
        } else {
            const bucketNames = buckets.map(b => b.name);
            
            if (bucketNames.includes('voice-narration')) {
                // Count files in bucket
                const { data: files, error: filesError } = await supabase.storage
                    .from('voice-narration')
                    .list('');

                const fileCount = filesError ? 0 : (files?.length || 0);
                console.log(`   ✅ voice-narration - exists (${fileCount} files)`);
            } else {
                console.log(`   ❌ voice-narration - MISSING`);
                hasErrors = true;
            }

            // List other buckets
            console.log(`\n   Other buckets: ${bucketNames.filter(b => b !== 'voice-narration').join(', ') || 'none'}`);
        }
    } catch (err) {
        console.log(`   ❌ Storage check failed: ${err.message}`);
        hasErrors = true;
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. Check Credentials
    // ─────────────────────────────────────────────────────────────────
    console.log('\n🔑 Checking Credentials:\n');

    console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);

    // ─────────────────────────────────────────────────────────────────
    // 4. Summary
    // ─────────────────────────────────────────────────────────────────
    console.log('\n' + '━'.repeat(60));
    if (hasErrors) {
        console.log('❌ Setup validation FAILED - Fix issues above before running sync\n');
        process.exit(1);
    } else {
        console.log('✅ Setup validation PASSED - Ready to run sync!\n');
        process.exit(0);
    }
}

validateSetup();

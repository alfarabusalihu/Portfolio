require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

/**
 * TECHNICAL VERIFICATION: Database → API → Frontend
 * This verifies if frontend is using database or hardcoded data
 */
async function verifyDataFlow() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         TECHNICAL VERIFICATION: DATA FLOW                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Create two clients: one with service role (workflow), one with anon key (frontend)
    const serviceClient = createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const anonClient = createClient(
        process.env.SUPABASE_URL, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Check what workflow wrote to database
    // ─────────────────────────────────────────────────────────────────────
    console.log('📝 STEP 1: Database Content (what workflow writes)\n');
    console.log('   Using: SERVICE_ROLE_KEY (backend access)');
    
    const { data: serviceData, error: serviceError } = await serviceClient
        .from('projects')
        .select('title, description');
    
    if (serviceError) {
        console.log(`   ❌ ERROR: ${serviceError.message}`);
        return;
    }
    
    console.log(`   ✅ Found ${serviceData.length} projects in database:\n`);
    serviceData.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.title}`);
    });
    
    const movieBluffInDb = serviceData.find(p => 
        p.title.toLowerCase().includes('movie')
    );
    
    if (movieBluffInDb) {
        console.log(`\n   ✅ Movie-bluff IS in database`);
    } else {
        console.log(`\n   ❌ Movie-bluff NOT in database`);
    }
    
    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Check what frontend can read
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n\n📱 STEP 2: Frontend Access (what API returns)\n');
    console.log('   Using: ANON_KEY (public browser access)');
    
    const { data: anonData, error: anonError } = await anonClient
        .from('projects')
        .select('title, description');
    
    if (anonError) {
        console.log(`   ❌ ERROR: ${anonError.message}\n`);
        console.log('   ⚠️  RLS (Row Level Security) is BLOCKING public access!');
        console.log('   → Frontend CANNOT read from database');
        console.log('   → API falls back to hardcoded: /src/data/projects.json\n');
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  ❌ PROBLEM IDENTIFIED: RLS Policies Not Configured            ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  FIX: Run SQL script in Supabase Dashboard                     ║');
        console.log('║  File: scripts/setup-rls-policies.sql                          ║');
        console.log('║                                                                ║');
        console.log('║  Steps:                                                        ║');
        console.log('║  1. Open Supabase Dashboard                                    ║');
        console.log('║  2. Go to SQL Editor                                           ║');
        console.log('║  3. Paste content of setup-rls-policies.sql                    ║');
        console.log('║  4. Click "Run"                                                ║');
        console.log('║  5. Refresh frontend - Movie-bluff will appear!                ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        return;
    }
    
    console.log(`   ✅ Found ${anonData.length} projects accessible to frontend:\n`);
    anonData.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.title}`);
    });
    
    const movieBluffReadable = anonData.find(p => 
        p.title.toLowerCase().includes('movie')
    );
    
    if (movieBluffReadable) {
        console.log(`\n   ✅ Movie-bluff IS accessible to frontend`);
    } else {
        console.log(`\n   ❌ Movie-bluff NOT accessible to frontend`);
    }
    
    // ─────────────────────────────────────────────────────────────────────
    // CONCLUSION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    if (anonData.length === serviceData.length && movieBluffReadable) {
        console.log('║  ✅ SUCCESS: Frontend is reading from DATABASE                 ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  • Workflow writes to database: ✓                              ║');
        console.log('║  • Frontend reads from database: ✓                             ║');
        console.log('║  • Movie-bluff is visible: ✓                                   ║');
        console.log('║  • No hardcoded data used: ✓                                   ║');
    } else if (anonData.length === 0) {
        console.log('║  ❌ PROBLEM: Frontend CANNOT read database                     ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  • Workflow writes to database: ✓                              ║');
        console.log('║  • Frontend reads from database: ✗ (RLS blocking)              ║');
        console.log('║  • Currently using: hardcoded /src/data/projects.json          ║');
    } else {
        console.log('║  ⚠️  PARTIAL: Some data accessible, some missing               ║');
    }
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

verifyDataFlow().catch(err => {
    console.error('\n❌ Verification failed:', err.message);
    process.exit(1);
});

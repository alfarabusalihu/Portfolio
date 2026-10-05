require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testVoiceNarrations() {
    console.log('\n🔍 Testing Voice Narrations Setup\n');
    console.log('=' .repeat(60));
    
    // 1. Check voice_narrations table
    console.log('\n1️⃣  Checking voice_narrations table...');
    const { data: narrations, error: narrError } = await supabase
        .from('voice_narrations')
        .select('*')
        .order('generated_at', { ascending: false });
    
    if (narrError) {
        console.error('❌ Error querying table:', narrError.message);
    } else if (!narrations || narrations.length === 0) {
        console.log('⚠️  No voice narrations found in database');
    } else {
        console.log(`✅ Found ${narrations.length} voice narrations:\n`);
        narrations.forEach((n, idx) => {
            console.log(`   ${idx + 1}. ${n.project_title}`);
            console.log(`      URL: ${n.audio_url}`);
            console.log(`      Generated: ${n.generated_at}`);
            console.log(`      Script preview: ${n.script?.substring(0, 80)}...`);
            console.log('');
        });
    }
    
    // 2. Check storage bucket
    console.log('\n2️⃣  Checking voice-narration storage bucket...');
    const { data: files, error: storageError } = await supabase
        .storage
        .from('voice-narration')
        .list();
    
    if (storageError) {
        console.error('❌ Error accessing storage:', storageError.message);
    } else if (!files || files.length === 0) {
        console.log('⚠️  No files found in voice-narration bucket');
    } else {
        console.log(`✅ Found ${files.length} files in storage:\n`);
        files.forEach((f, idx) => {
            const publicUrl = supabase.storage
                .from('voice-narration')
                .getPublicUrl(f.name).data.publicUrl;
            
            console.log(`   ${idx + 1}. ${f.name}`);
            console.log(`      Size: ${(f.metadata?.size / 1024).toFixed(2)} KB`);
            console.log(`      Public URL: ${publicUrl}`);
            console.log('');
        });
    }
    
    // 3. Test URL accessibility
    if (narrations && narrations.length > 0) {
        console.log('\n3️⃣  Testing URL accessibility...');
        const testUrl = narrations[0].audio_url;
        console.log(`Testing: ${testUrl}\n`);
        
        try {
            const response = await fetch(testUrl, { method: 'HEAD' });
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            console.log(`Content-Length: ${response.headers.get('content-length')}`);
            console.log(`Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
            
            if (response.ok) {
                console.log('\n✅ URL is publicly accessible');
            } else {
                console.log('\n❌ URL returned error status');
            }
        } catch (err) {
            console.error('\n❌ Failed to access URL:', err.message);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete\n');
}

testVoiceNarrations().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get recipient email from environment variable
        const recipientEmail = process.env.CONTACT_EMAIL || 'alfarabusalihu@gmail.com';

        // 1. Save to Supabase (if available)
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (supabaseUrl && supabaseServiceKey) {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                await supabase.from('contact_messages').insert({
                    name,
                    email,
                    message,
                    created_at: new Date().toISOString(),
                    read: false,
                });
            } else {
                console.warn('Supabase unavailable - message not saved to database');
            }
        } catch (dbError) {
            console.error('Failed to save message to DB:', dbError);
            // We can continue to try sending the email even if DB fails
        }

        // 2. Forward to FormSubmit for email notification
        // Skip FormSubmit for system-generated alerts (they use fake email addresses)
        const isSystemAlert = email.includes('noreply@') || email.includes('portfolio-system');
        
        if (!isSystemAlert) {
            try {
                const res = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        message,
                        _subject: `Portfolio message from ${name}`,
                        _captcha: 'false',
                    }),
                });

                if (!res.ok) {
                    console.error('FormSubmit failed:', await res.text());
                    // Still return success to user since we saved to DB
                }
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Still return success to user since we saved to DB
            }
        } else {
            // For system alerts, just log them (they're already in DB if Supabase is available)
            console.log('📧 System alert received:', { name, message: message.substring(0, 100) });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

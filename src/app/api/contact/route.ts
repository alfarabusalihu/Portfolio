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

        // 2. Send email notification
        // For system alerts (errors), send to owner via FormSubmit
        // For regular contact form, also send via FormSubmit
        try {
            const isSystemAlert = email.includes('noreply@') || email.includes('portfolio-system');
            
            const emailSubject = isSystemAlert 
                ? `⚠️ Portfolio System Alert` 
                : `Portfolio message from ${name}`;
            
            const res = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: isSystemAlert ? '🚨 System Alert' : name,
                    email: isSystemAlert ? recipientEmail : email, // Use owner's email for system alerts
                    message,
                    _subject: emailSubject,
                    _captcha: 'false',
                }),
            });

            if (!res.ok) {
                console.error('FormSubmit failed:', await res.text());
            } else {
                console.log('✅ Email sent successfully');
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

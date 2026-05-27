import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Save to MongoDB
        try {
            const db = await getDb();
            await db.collection('messages').insertOne({
                name,
                email,
                message,
                createdAt: new Date(),
                read: false,
            });
        } catch (dbError) {
            console.error('Failed to save message to DB:', dbError);
            // We can continue to try sending the email even if DB fails
        }

        // 2. Forward to FormSubmit for email notification
        try {
            const res = await fetch('https://formsubmit.co/ajax/alfarabusalihu@gmail.com', {
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

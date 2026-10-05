import { NextRequest, NextResponse } from 'next/server';

const GH_OWNER = 'alfarabusalihu';
const GH_REPO = 'Portfolio';
const WORKFLOW_FILE = 'update-skills.yml';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const action = req.nextUrl.searchParams.get('action');
    const token = process.env.TOKEN_GIT;

    const headers: HeadersInit = {
        Accept: 'application/vnd.github+json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        if (action === 'repos') {
            const url = `https://api.github.com/users/${GH_OWNER}/repos?per_page=100&sort=updated`;
            const res = await fetch(url, { headers, cache: 'no-store' });
            if (!res.ok) {
                return NextResponse.json({ error: 'Failed to fetch repos', status: res.status }, { status: res.status });
            }
            const data = await res.json();
            return NextResponse.json(data);
        } 
        
        if (action === 'runs') {
            const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`;
            const res = await fetch(url, { headers, cache: 'no-store' });
            if (!res.ok) {
                console.error('Failed to fetch runs:', res.status, await res.text());
                return NextResponse.json({ error: 'Failed to fetch runs', status: res.status }, { status: res.status });
            }
            const data = await res.json();
            return NextResponse.json(data);
        }

        if (action === 'check-token') {
            // Diagnostic endpoint to verify token permissions
            if (!token) {
                return NextResponse.json({ 
                    valid: false, 
                    message: 'TOKEN_GIT not set in environment variables' 
                }, { status: 400 });
            }

            try {
                const userRes = await fetch('https://api.github.com/user', { headers, cache: 'no-store' });
                const userData = await userRes.json();
                
                const repoRes = await fetch(
                    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`,
                    { headers, cache: 'no-store' }
                );

                return NextResponse.json({
                    valid: userRes.ok,
                    user: userData.login,
                    hasRepoAccess: repoRes.ok,
                    scopes: userRes.headers.get('x-oauth-scopes')?.split(',').map(s => s.trim()) || [],
                    message: userRes.ok ? 'Token is valid' : 'Token is invalid or expired'
                });
            } catch (err) {
                return NextResponse.json({
                    valid: false,
                    message: 'Failed to verify token',
                    error: String(err)
                }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error', detail: String(err) }, { status: 500 });
    }
}

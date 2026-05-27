import { NextResponse } from 'next/server';

const GH_OWNER = 'alfarabusalihu';
const GH_REPO = 'alfarabusalihu.github.io';
const WORKFLOW_FILE = 'update-skills.yml';

export async function POST() {
    const token = process.env.GH_ACTIONS_TOKEN;

    if (!token) {
        return NextResponse.json(
            { error: 'GITHUB_ACTIONS_TOKEN is not configured on the server.' },
            { status: 500 },
        );
    }

    try {
        const res = await fetch(
            `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ref: 'main' }),
            },
        );

        if (res.status === 204) {
            return NextResponse.json({ ok: true });
        }

        const body = await res.text();
        return NextResponse.json(
            { error: 'GitHub API rejected the dispatch.', detail: body },
            { status: res.status },
        );
    } catch (err) {
        return NextResponse.json(
            { error: 'Failed to reach GitHub API.', detail: String(err) },
            { status: 502 },
        );
    }
}

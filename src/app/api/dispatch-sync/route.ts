import { NextResponse } from 'next/server';

const GH_OWNER = 'alfarabusalihu';
const GH_REPO = 'Portfolio';
const WORKFLOW_FILE = 'update-skills.yml';

export async function POST() {
    const token = process.env.TOKEN_GIT;

    if (!token) {
        return NextResponse.json(
            { error: 'GITHUB_ACTIONS_TOKEN is not configured on the server.' },
            { status: 500 },
        );
    }

    try {
        // First, verify the workflow exists
        const workflowCheck = await fetch(
            `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${WORKFLOW_FILE}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                },
            },
        );

        if (!workflowCheck.ok) {
            const checkBody = await workflowCheck.text();
            return NextResponse.json(
                { error: 'Workflow file not found or inaccessible', detail: checkBody },
                { status: workflowCheck.status },
            );
        }

        // Dispatch the workflow
        const res = await fetch(
            `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                body: JSON.stringify({ ref: 'main' }),
            },
        );

        if (res.status === 204) {
            return NextResponse.json({ 
                ok: true, 
                message: 'Workflow dispatched successfully. Check Actions tab on GitHub.' 
            });
        }

        const body = await res.text();
        console.error('GitHub dispatch failed:', res.status, body);
        
        return NextResponse.json(
            { 
                error: 'GitHub API rejected the dispatch.', 
                status: res.status,
                detail: body,
                hint: res.status === 422 ? 'Check if workflow_dispatch is enabled and branch exists' : undefined
            },
            { status: res.status },
        );
    } catch (err) {
        console.error('Dispatch error:', err);
        return NextResponse.json(
            { error: 'Failed to reach GitHub API.', detail: String(err) },
            { status: 502 },
        );
    }
}

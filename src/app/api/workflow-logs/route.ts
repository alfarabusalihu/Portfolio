import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'last';

    try {
        // Ensure logs directory exists
        if (!fs.existsSync(LOGS_DIR)) {
            return NextResponse.json({
                error: 'No workflow logs yet',
                action: 'wait for first workflow to complete',
            }, { status: 404 });
        }

        const files = fs.readdirSync(LOGS_DIR)
            .filter(f => f.startsWith('workflow-') && f.endsWith('.json'))
            .sort()
            .reverse();

        if (files.length === 0) {
            return NextResponse.json({
                error: 'No workflow logs found',
                action: 'wait for first workflow to complete',
            }, { status: 404 });
        }

        // Action: Get last report
        if (action === 'last') {
            const filepath = path.join(LOGS_DIR, files[0]);
            const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
            return NextResponse.json({
                file: files[0],
                report: content,
                loadedAt: new Date().toISOString(),
            });
        }

        // Action: Get last successful report
        if (action === 'last-success') {
            for (const file of files) {
                const filepath = path.join(LOGS_DIR, file);
                const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
                if (content.summary.status === 'SUCCESS') {
                    return NextResponse.json({
                        file,
                        report: content,
                        loadedAt: new Date().toISOString(),
                    });
                }
            }
            return NextResponse.json({
                error: 'No successful workflows found',
            }, { status: 404 });
        }

        // Action: Get all reports summary
        if (action === 'all') {
            const reports = files.map(file => {
                const filepath = path.join(LOGS_DIR, file);
                const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
                return {
                    file,
                    status: content.summary.status,
                    timestamp: content.metadata.startTime,
                    duration: content.metadata.totalDurationSeconds,
                    errors: content.summary.errors,
                    warnings: content.summary.warnings,
                };
            });

            return NextResponse.json({
                totalReports: reports.length,
                reports,
                loadedAt: new Date().toISOString(),
            });
        }

        // Action: Get report by date
        if (action === 'by-date') {
            const date = searchParams.get('date');
            if (!date) {
                return NextResponse.json(
                    { error: 'Date parameter required (YYYY-MM-DD)' },
                    { status: 400 }
                );
            }

            const matchingFiles = files.filter(f => f.includes(date));
            if (matchingFiles.length === 0) {
                return NextResponse.json({
                    error: `No reports found for ${date}`,
                }, { status: 404 });
            }

            const reports = matchingFiles.map(file => {
                const filepath = path.join(LOGS_DIR, file);
                const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
                return {
                    file,
                    report: content,
                };
            });

            return NextResponse.json({
                date,
                reports,
                count: reports.length,
            });
        }

        return NextResponse.json({
            error: 'Unknown action',
            availableActions: ['last', 'last-success', 'all', 'by-date'],
        }, { status: 400 });

    } catch (error) {
        console.error('Workflow logs API error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

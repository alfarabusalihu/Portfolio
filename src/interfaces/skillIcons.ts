/**
 * Skill Icon Map — frontend-side icon resolution.
 *
 * The API returns raw skill names from the database.
 * This map resolves each skill name to a Lucide icon component name.
 * If a skill isn't found here, it falls back to 'Zap'.
 *
 * To add a new skill icon: add an entry with the lowercase skill name as key
 * and the PascalCase Lucide icon name as value.
 */

export const SKILL_ICON_MAP: Record<string, string> = {
    // ── Languages ──────────────────────────────────────
    'javascript':                     'Braces',
    'typescript':                     'FileCode',
    'python':                         'FileCode',
    'go':                             'Cpu',
    'java':                           'Coffee',
    'c#':                             'Hash',
    'rust':                           'Cog',
    'ruby':                           'Gem',
    'php':                            'Code',
    'swift':                          'Zap',
    'kotlin':                         'Smartphone',
    'dart':                           'Feather',

    // ── Frontend frameworks ────────────────────────────
    'next.js':                        'Globe',
    'nextjs':                         'Globe',
    'react':                          'Atom',
    'reactjs':                        'Atom',
    'react native':                   'Smartphone',
    'angular':                        'Triangle',
    'vue':                            'Eye',
    'vuejs':                          'Eye',
    'svelte':                         'Flame',

    // ── Styling ────────────────────────────────────────
    'tailwind css':                   'Paintbrush',
    'tailwindcss':                    'Paintbrush',
    'ant design':                     'Layout',
    'shadcn':                         'Layers',
    'html':                           'FileCode2',
    'css':                            'Paintbrush2',
    'sass':                           'Palette',
    'material ui':                    'Layers',

    // ── Backend frameworks ─────────────────────────────
    'node.js':                        'Server',
    'nodejs':                         'Server',
    'express.js':                     'Server',
    'expressjs':                      'Server',
    'nest.js':                        'Server',
    'nestjs':                         'Server',
    'fastify':                        'Rocket',
    'django':                         'Server',
    'flask':                          'Flask',
    'spring boot':                    'Leaf',

    // ── APIs ───────────────────────────────────────────
    'rest api development':           'Plug',
    'rest api':                       'Plug',
    'graphql':                        'Share2',

    // ── AI / ML ────────────────────────────────────────
    'llms (gemini, llama)':           'BrainCircuit',
    'llms':                           'BrainCircuit',
    'vector databases (sqlite, qdrant)': 'Database',
    'vector databases':               'Database',
    'prompt engineering':             'MessageSquare',
    'machine learning':               'Brain',
    'tensorflow':                     'Brain',
    'pytorch':                        'Brain',
    'langchain':                      'Link',
    'openai':                         'BrainCircuit',

    // ── Databases ──────────────────────────────────────
    'postgresql':                     'Database',
    'mongodb':                        'Database',
    'mysql':                          'Database',
    'amazon dynamodb':                'Database',
    'dynamodb':                       'Database',
    'sqlite':                         'Database',
    'qdrant':                         'Database',
    'redis':                          'Database',
    'supabase':                       'Database',
    'firebase':                       'Flame',
    'prisma':                         'Database',

    // ── Cloud & DevOps ─────────────────────────────────
    'aws (s3, dynamodb)':             'Cloud',
    'aws':                            'Cloud',
    'docker':                         'Container',
    'terraform':                      'Layers',
    'kubernetes':                     'Box',
    'ci/cd':                          'RefreshCw',
    'github actions':                 'GitBranch',
    'vercel':                         'Triangle',
    'netlify':                        'Globe',

    // ── Tools ──────────────────────────────────────────
    'git':                            'GitBranch',
    'jira':                           'Trello',
    'figma':                          'Figma',
    'n8n':                            'Zap',
    'postman':                        'Send',
    'vs code':                        'Code',
    'linux':                          'Terminal',
    'nginx':                          'Server',

    // ── Testing ────────────────────────────────────────
    'jest':                           'TestTube',
    'cypress':                        'Monitor',
    'playwright':                     'Monitor',
    'vitest':                         'TestTube',
};

/** Resolve a skill name to a Lucide icon name. Falls back to 'Zap'. */
export function resolveSkillIcon(skillName: string): string {
    if (!skillName) return 'Zap';
    return SKILL_ICON_MAP[skillName.toLowerCase().trim()] || 'Zap';
}

/** Skill shape as returned by the API */
export interface Skill {
    name: string;
    icon?: string;
}

/** Skills grouped by category */
export interface SkillsData {
    stacks: Skill[];
    tools: Skill[];
}

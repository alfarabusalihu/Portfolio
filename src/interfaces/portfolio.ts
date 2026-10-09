import { Project } from './projects';
import { SkillsData } from './skillIcons';

export interface PortfolioMetadata {
    lastSync?: string;
    lastSynced?: string;
    skillsCount?: number;
    projectsCount?: number;
    version?: string;
    cvFileId?: string;
    imgFileId?: string;
    cvModifiedTime?: string;
    imgModifiedTime?: string;
}

export interface PortfolioDataContextType {
    projects: Project[];
    skills: SkillsData;
    metadata: PortfolioMetadata;
    voiceNarrations: Record<string, string>;
    isRefreshing: boolean;
    refreshData: () => Promise<void>;
}

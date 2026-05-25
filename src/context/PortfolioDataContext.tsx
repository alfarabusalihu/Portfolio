'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialSkills from '../data/generated-skills.json';
import initialProjects from '../data/projects.json';

interface Project {
    title: string;
    description: string;
    image: string;
    link: string;
    websiteLink?: string;
    tags: string[];
    isAutoSync?: boolean;
}

interface Skill {
    name: string;
    icon: string;
}

interface SkillsData {
    stacks: Skill[];
    tools: Skill[];
}

interface PortfolioMetadata {
    cvFileId: string;
    imgFileId: string;
    lastSync: string;
}

interface PortfolioDataContextType {
    projects: Project[];
    skills: SkillsData;
    metadata: PortfolioMetadata;
    isRefreshing: boolean;
    refreshData: () => Promise<void>;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

const FALLBACK_METADATA: PortfolioMetadata = { cvFileId: '', imgFileId: '', lastSync: '' };

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(initialProjects as Project[]);
    const [skills, setSkills] = useState<SkillsData>(initialSkills as SkillsData);
    const [metadata, setMetadata] = useState<PortfolioMetadata>(FALLBACK_METADATA);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [projectsRes, skillsRes, metadataRes] = await Promise.all([
                fetch('/api/projects', { cache: 'no-store' }),
                fetch('/api/skills', { cache: 'no-store' }),
                fetch('/api/metadata', { cache: 'no-store' }),
            ]);

            if (projectsRes.ok) setProjects(await projectsRes.json());
            if (skillsRes.ok) setSkills(await skillsRes.json());
            if (metadataRes.ok) setMetadata(await metadataRes.json());
        } catch (error) {
            console.error('Failed to refresh portfolio data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Load live data on mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <PortfolioDataContext.Provider value={{ projects, skills, metadata, isRefreshing, refreshData }}>
            {children}
        </PortfolioDataContext.Provider>
    );
};

export const usePortfolioData = () => {
    const context = useContext(PortfolioDataContext);
    if (context === undefined) {
        throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
    }
    return context;
};

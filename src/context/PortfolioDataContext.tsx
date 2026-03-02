'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialSkills from '../data/generated-skills.json';
import initialProjects from '../data/projects.json';
import initialMetadata from '../data/cv-metadata.json';

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
    cvModifiedTime: string;
    imgModifiedTime: string;
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

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/alfarabusalihu/Portfolio/main/src/data';

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(initialProjects as Project[]);
    const [skills, setSkills] = useState<SkillsData>(initialSkills as SkillsData);
    const [metadata, setMetadata] = useState<PortfolioMetadata>(initialMetadata as PortfolioMetadata);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Fetch with cache: 'no-store' to get latest from GitHub
            const [projectsRes, skillsRes, metadataRes] = await Promise.all([
                fetch(`${GITHUB_RAW_BASE}/projects.json`, { cache: 'no-store' }),
                fetch(`${GITHUB_RAW_BASE}/generated-skills.json`, { cache: 'no-store' }),
                fetch(`${GITHUB_RAW_BASE}/cv-metadata.json`, { cache: 'no-store' })
            ]);

            if (projectsRes.status === 200) {
                const newProjects = await projectsRes.json();
                setProjects(newProjects);
            }

            if (skillsRes.status === 200) {
                const newSkills = await skillsRes.json();
                setSkills(newSkills);
            }

            if (metadataRes.status === 200) {
                const newMetadata = await metadataRes.json();
                setMetadata(newMetadata);
            }
        } catch (error) {
            console.error('Failed to refresh portfolio data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

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

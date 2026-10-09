'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import type { Project, SkillsData, PortfolioMetadata, PortfolioDataContextType } from '../interfaces';

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

const FALLBACK_METADATA: PortfolioMetadata = { cvFileId: '', imgFileId: '', lastSync: '' };

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<SkillsData>({ stacks: [], tools: [] });
    const [metadata, setMetadata] = useState<PortfolioMetadata>(FALLBACK_METADATA);
    const [voiceNarrations, setVoiceNarrations] = useState<Record<string, string>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [projectsRes, skillsRes, metadataRes, voiceRes] = await Promise.all([
                fetch('/api/projects', { cache: 'no-store' }),
                fetch('/api/skills', { cache: 'no-store' }),
                fetch('/api/metadata', { cache: 'no-store' }),
                fetch('/api/voice-narrations', { cache: 'no-store' }),
            ]);

            if (projectsRes.ok) {
                const data = await projectsRes.json();
                if (Array.isArray(data)) setProjects(data);
            }
            if (skillsRes.ok) {
                const data = await skillsRes.json();
                if (data && (data.stacks || data.tools)) setSkills(data);
            }
            if (metadataRes.ok) setMetadata(await metadataRes.json());
            if (voiceRes.ok) {
                const voiceData = await voiceRes.json();
                setVoiceNarrations(voiceData.narrations || {});
            }
        } catch (error) {
            console.error('Failed to refresh portfolio data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Load live database data on mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <PortfolioDataContext.Provider value={{ projects, skills, metadata, voiceNarrations, isRefreshing, refreshData }}>
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

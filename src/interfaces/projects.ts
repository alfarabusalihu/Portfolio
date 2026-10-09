export interface Project {
    title: string;
    description: string;
    image: string;
    link: string;
    websiteLink?: string;
    tags: string[];
    isAutoSync?: boolean;
    isPrivate?: boolean;
}

export interface ProjectCardProps {
    project: Project;
    compact?: boolean;
    showSpeaker?: boolean;
    voiceUrl?: string;
}

export interface ProjectsSectionProps {
    specialtonMode?: boolean;
    isVisible?: boolean;
}

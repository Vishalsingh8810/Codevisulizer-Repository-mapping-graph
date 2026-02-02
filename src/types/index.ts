export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'dir';
    size?: number;
    children?: FileNode[];
    url?: string;
    imports?: string[]; // List of imported modules/files
}

export interface RepoDetails {
    owner: string;
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    default_branch: string;
}

export interface TechStack {
    frontend?: string[];
    backend?: string[];
    languages: string[];
    tools?: string[];
    ai_ml?: string[];
}

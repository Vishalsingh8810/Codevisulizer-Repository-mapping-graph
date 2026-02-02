import React, { useState } from 'react';
import { Search, Github, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface RepoInputProps {
    onSubmit: (owner: string, repo: string) => void;
    isLoading: boolean;
    className?: string;
}

export function RepoInput({ onSubmit, isLoading, className }: RepoInputProps) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        // Parse URL: https://github.com/owner/repo
        try {
            const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) {
                setError('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
                return;
            }
            setError('');
            onSubmit(match[1], match[2].replace(/\.git$/, ''));
        } catch (err) {
            setError('Failed to parse URL');
        }
    };

    return (
        <div className={twMerge("w-full max-w-2xl mx-auto space-y-4", className)}>
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-surface rounded-xl p-2 flex items-center shadow-2xl border border-slate-700/50">
                    <Github className="w-6 h-6 text-slate-400 ml-3" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste GitHub Repository URL (e.g., https://github.com/facebook/react)"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 px-4 py-3 text-lg"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        <span>Analyze</span>
                    </button>
                </div>
            </form>
            {error && (
                <p className="text-red-400 text-sm text-center animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
}

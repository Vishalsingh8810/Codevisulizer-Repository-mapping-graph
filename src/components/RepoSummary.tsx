
import { Star, GitFork } from 'lucide-react';
import type { RepoDetails } from '../types';

interface RepoSummaryProps {
    details: RepoDetails;
}

export function RepoSummary({ details }: RepoSummaryProps) {
    return (
        <div className="bg-surface border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-slate-400 font-normal">{details.owner} /</span>
                        {details.name}
                    </h1>
                    <p className="text-slate-400 mt-1 max-w-2xl">{details.description}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-slate-200">{details.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                        <GitFork className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-200">{details.forks.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="font-medium text-slate-200">{details.language}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

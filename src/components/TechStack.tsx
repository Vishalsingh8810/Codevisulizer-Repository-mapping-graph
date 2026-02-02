
import { Zap, Server, Layout, Box, Brain } from 'lucide-react';
import type { TechStack as TechStackType } from '../types';

interface TechStackProps {
    tech: TechStackType;
}

export function TechStack({ tech }: TechStackProps) {
    return (
        <div className="bg-surface border border-slate-700/50 rounded-xl p-4 shadow-lg space-y-4 h-full">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Detected Tech Stack
            </h3>

            <div className="space-y-4">
                {tech.frontend && tech.frontend.length > 0 && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                            <Layout className="w-3 h-3" /> Frontend
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {tech.frontend.map(t => (
                                <span key={t} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {tech.backend && tech.backend.length > 0 && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                            <Server className="w-3 h-3" /> Backend
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {tech.backend.map(t => (
                                <span key={t} className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {tech.ai_ml && tech.ai_ml.length > 0 && (
                    <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                            <Brain className="w-3 h-3" /> AI & Data Science
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {tech.ai_ml.map(t => (
                                <span key={t} className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Box className="w-3 h-3" /> Languages & Tools
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {tech.languages.map(t => (
                            <span key={t} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600">
                                {t}
                            </span>
                        ))}
                        {tech.tools && tech.tools.map(t => (
                            <span key={t} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

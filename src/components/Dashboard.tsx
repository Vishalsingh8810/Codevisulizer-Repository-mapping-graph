import { useState, useMemo } from 'react';
import { RepoInput } from './RepoInput';
import { RepoSummary } from './RepoSummary';
import { FileExplorer } from './FileExplorer';
import { DependencyGraph } from './DependencyGraph';
import { TechStack } from './TechStack';
import { fetchRepoDetails, fetchRepoStructure } from '../services/github';
import { detectTechStack } from '../utils/techDetector';
import type { FileNode, RepoDetails, TechStack as TechStackType } from '../types';
import { Github, Code2, Share2, Layers, Search } from 'lucide-react';
import { clsx } from 'clsx';

export function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<RepoDetails | null>(null);
    const [structure, setStructure] = useState<FileNode | null>(null);
    const [techStack, setTechStack] = useState<TechStackType | null>(null);
    const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => {
        if (!structure) return { files: 0, folders: 0 };
        let files = 0;
        let folders = 0;
        const traverse = (node: FileNode) => {
            if (node.type === 'dir') {
                folders++;
                node.children?.forEach(traverse);
            } else {
                files++;
            }
        };
        traverse(structure);
        return { files, folders: folders - 1 }; // Subtract root folder
    }, [structure]);

    const handleAnalyze = async (owner: string, repo: string) => {
        setLoading(true);
        setError('');
        setDetails(null);
        setStructure(null);
        setTechStack(null);

        try {
            const [repoDetails, repoStructure] = await Promise.all([
                fetchRepoDetails(owner, repo),
                fetchRepoStructure(owner, repo)
            ]);

            setDetails(repoDetails);
            setStructure(repoStructure);

            // Detect tech stack (now async)
            const stack = await detectTechStack(repoStructure, owner, repo);
            setTechStack(stack);

            setSelectedNode(repoStructure); // Start with root
        } catch (err) {
            console.error(err);
            setError('Failed to fetch repository data. Check the URL or API rate limits.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-primary/30 relative overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            {/* Header */}
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-black/20">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">CodeVisualizer</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </nav>

            <main className={clsx(
                "max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300",
                isFullscreen ? "opacity-0 pointer-events-none absolute" : "opacity-100 relative"
            )}>
                {!details && (
                    <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
                        <div className="mb-8 p-4 bg-white/5 rounded-full border border-white/10 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <Layers className="w-12 h-12 text-slate-200 relative z-10" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-center mb-8 bg-gradient-to-r from-white via-slate-200 to-slate-400 text-transparent bg-clip-text tracking-tight">
                            Visualize Code <br /> Like Never Before
                        </h1>
                        <p className="text-slate-400 text-xl text-center max-w-2xl mb-12 leading-relaxed">
                            Turn complex GitHub repositories into interactive maps. <br />
                            <span className="text-slate-500">Understand architecture, dependencies, and tech stacks in seconds.</span>
                        </p>
                        <RepoInput onSubmit={handleAnalyze} isLoading={loading} className="scale-110" />
                        {error && (
                            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                    </div>
                )}

                {loading && !details && (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"></div>
                        </div>
                        <p className="text-slate-400 animate-pulse font-medium">Analyzing Repository Architecture...</p>
                    </div>
                )}

                {details && structure && techStack && (
                    <div className="animate-fade-in space-y-8">
                        {/* Summary Section */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1 w-full transform hover:scale-[1.01] transition-transform duration-300">
                                <RepoSummary details={details} />
                            </div>
                            <div className="w-full md:w-auto self-center flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search files..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setDetails(null);
                                        setStructure(null);
                                        setTechStack(null);
                                        setSearchQuery('');
                                    }}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all hover:text-white font-medium hover:shadow-lg hover:shadow-white/5 active:scale-95"
                                >
                                    Analyze Another
                                </button>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[850px]">
                            {/* Left Sidebar: File Explorer */}
                            <div className="lg:col-span-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                                <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <h3 className="font-semibold text-white/90">Explorer</h3>
                                    <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">{stats.files} Files</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    {/* Pass logic to filter filter explorer if needed, or simple highlight. For now standard explorer */}
                                    <FileExplorer node={structure} onSelect={setSelectedNode} selectedPath={selectedNode?.path} />
                                </div>
                            </div>

                            {/* Center: Graph */}
                            <div className="lg:col-span-6 flex flex-col h-full">
                                <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group bg-black/40">
                                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-slate-300 border border-white/10 shadow-lg">
                                        Dependency Graph
                                    </div>
                                    <DependencyGraph
                                        rootNode={structure}
                                        isFullscreen={false} // This component instance is for the grid
                                        onToggleFullscreen={() => setIsFullscreen(true)}
                                        searchQuery={searchQuery}
                                        maxDepth={4} // Performance limit
                                    />
                                </div>
                            </div>

                            {/* Right: details & Tech Stack */}
                            <div className="lg:col-span-3 flex flex-col gap-8 h-full">
                                <div className="transform hover:translate-y-[-4px] transition-transform duration-300">
                                    <TechStack tech={techStack} />
                                </div>

                                <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 shadow-2xl flex-1 backdrop-blur-sm">
                                    <h3 className="font-semibold text-white/90 mb-6 flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-purple-400" />
                                        Repository Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                            <span className="text-slate-400 group-hover:text-slate-300">Total Files</span>
                                            <span className="text-white font-mono font-bold bg-blue-500/20 px-2 py-1 rounded text-blue-300">{stats.files}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                            <span className="text-slate-400 group-hover:text-slate-300">Total Folders</span>
                                            <span className="text-white font-mono font-bold bg-violet-500/20 px-2 py-1 rounded text-violet-300">{stats.folders}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                            <span className="text-slate-400 group-hover:text-slate-300">Graph Nodes</span>
                                            <span className="text-white font-mono font-bold bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">{stats.files + stats.folders + 1}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse-slow"></div>
                                        <p className="text-xs text-blue-300 relative z-10 leading-relaxed">
                                            <strong>Pro Tip:</strong> Use the search bar to highlight specific files in the graph.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Independent Fullscreen Graph Container */}
            {isFullscreen && structure && (
                <DependencyGraph
                    rootNode={structure}
                    isFullscreen={true}
                    onToggleFullscreen={() => setIsFullscreen(false)}
                    searchQuery={searchQuery}
                    maxDepth={10} // Higher limit for fullscreen
                />
            )}
        </div>
    );
}

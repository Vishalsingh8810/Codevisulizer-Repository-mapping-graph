import React, { useMemo, useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
    useNodesState,
    useEdgesState,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { FileNode } from '../types';
import { Maximize2, Minimize2, Info, Download, Layout as LayoutIcon, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import { toPng } from 'html-to-image';

interface DependencyGraphProps {
    rootNode: FileNode;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    searchQuery: string;
    maxDepth?: number;
}

type LayoutType = 'tree' | 'radial';
type ThemeType = 'default' | 'fileType' | 'depth';

// Theme Configuration
const THEMES = {
    default: {
        folder: '#3b82f6',
        file: '#64748b',
        edge: '#475569'
    },
    fileType: {
        folder: '#3b82f6',
        ts: '#2563eb',
        js: '#facc15',
        css: '#ec4899',
        json: '#f97316',
        default: '#64748b'
    },
    depth: [
        '#3b82f6', // Depth 0
        '#60a5fa', // Depth 1
        '#93c5fd', // Depth 2
        '#bfdbfe', // Depth 3
        '#dbeafe'  // Depth 4+
    ]
};

const getThemeColor = (node: FileNode, theme: ThemeType, depth: number) => {
    if (theme === 'depth') {
        const index = Math.min(depth, THEMES.depth.length - 1);
        return THEMES.depth[index];
    }

    if (theme === 'fileType') {
        if (node.type === 'dir') return THEMES.fileType.folder;
        if (node.name.endsWith('.ts') || node.name.endsWith('.tsx')) return THEMES.fileType.ts;
        if (node.name.endsWith('.js') || node.name.endsWith('.jsx')) return THEMES.fileType.js;
        if (node.name.endsWith('.css') || node.name.endsWith('.scss')) return THEMES.fileType.css;
        if (node.name.endsWith('.json')) return THEMES.fileType.json;
        return THEMES.fileType.default;
    }

    // Default
    return node.type === 'dir' ? THEMES.default.folder : THEMES.default.file;
};

const getLayoutElements = (
    root: FileNode,
    searchQuery: string,
    maxDepth: number,
    layout: LayoutType,
    theme: ThemeType
): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const flatten = (node: FileNode, parentId?: string, x: number = 0, y: number = 0, level: number = 0, angleRange: [number, number] = [0, 360]) => {
        if (!searchQuery && level > maxDepth) return;

        const id = node.path || node.name;
        const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase());

        let opacity = 1;
        if (searchQuery && !matchesSearch) opacity = 0.2;

        const borderColor = getThemeColor(node, theme, level);
        const bg = node.type === 'dir' ? '#1e293b' : '#0f172a';

        let position = { x, y };

        // RADIAL LAYOUT CALCULATION
        if (layout === 'radial') {
            if (level === 0) {
                position = { x: 0, y: 0 };
            } else {
                const radius = level * 250;
                // Simple radial: distribute children evenly within parent's angle range
                // Determine 'mid' angle
                const angleMid = (angleRange[0] + angleRange[1]) / 2;
                // Convert to radians
                const rad = (angleMid * Math.PI) / 180;
                position = {
                    x: Math.cos(rad) * radius,
                    y: Math.sin(rad) * radius
                };
            }
        }

        nodes.push({
            id,
            position,
            data: { label: node.name },
            style: {
                background: bg,
                color: '#fff',
                border: `2px solid ${borderColor}`,
                borderRadius: node.type === 'dir' ? '12px' : '8px',
                padding: '12px',
                width: 160,
                fontSize: '12px',
                boxShadow: node.type === 'dir' ? `0 0 15px ${borderColor}40` : 'none',
                opacity
            },
            type: 'default', // Using default node type
            draggable: true
        });

        if (parentId) {
            edges.push({
                id: `${parentId}-${id}`,
                source: parentId,
                target: id,
                type: layout === 'radial' ? 'straight' : 'bezier',
                animated: true,
                style: { stroke: '#475569', strokeWidth: 2, opacity }
            });
        }

        if (node.children) {
            const childCount = node.children.length;

            if (layout === 'tree') {
                let childY = y + 150;
                const totalWidth = childCount * 180;
                let startX = x - (totalWidth / 2);

                node.children.forEach((child, index) => {
                    flatten(child, id, startX + (index * 180), childY, level + 1);
                });
            } else if (layout === 'radial') {
                // Divide the angle range among children
                const totalAngle = angleRange[1] - angleRange[0];
                const anglePerChild = totalAngle / (childCount || 1); // Avoid div by 0

                node.children.forEach((child, index) => {
                    const startAngle = angleRange[0] + (index * anglePerChild);
                    const endAngle = startAngle + anglePerChild;
                    flatten(child, id, 0, 0, level + 1, [startAngle, endAngle]);
                });
            }
        }
    };

    flatten(root, undefined, 0, 0, 0, [0, 360]);
    return { nodes, edges };
};

export function DependencyGraph({ rootNode, isFullscreen, onToggleFullscreen, searchQuery, maxDepth = 4 }: DependencyGraphProps) {
    const [layout, setLayout] = useState<LayoutType>('tree');
    const [theme, setTheme] = useState<ThemeType>('fileType');

    const { initialNodes, initialEdges } = useMemo(() => {
        const { nodes, edges } = getLayoutElements(rootNode, searchQuery, maxDepth, layout, theme);
        return { initialNodes: nodes, initialEdges: edges };
    }, [rootNode, searchQuery, maxDepth, layout, theme]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = getLayoutElements(rootNode, searchQuery, maxDepth, layout, theme);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [rootNode, searchQuery, maxDepth, layout, theme, setNodes, setEdges]);

    // Fit view on layout change
    const onInit = useCallback((reactFlowInstance: any) => {
        reactFlowInstance.fitView();
    }, []);

    // When layout changes, we might want to force fitView again
    // But ReactFlow handles nodes prop updates gracefully.

    const downloadImage = () => {
        const el = document.querySelector('.react-flow') as HTMLElement;
        if (!el) return;
        toPng(el, { backgroundColor: '#0f172a', width: 1920, height: 1080, style: { width: '1920px', height: '1080px' } })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'codevisualizer-graph.png';
                link.href = dataUrl;
                link.click();
            });
    }

    return (
        <div className={clsx(
            "relative transition-all duration-300 ease-in-out bg-slate-900 group",
            isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "w-full h-[600px] border border-slate-700/50 rounded-2xl overflow-hidden"
        )}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={onInit}
                fitView
                minZoom={0.1}
                maxZoom={2}
                className="react-flow"
            >
                <Background color="#1e293b" gap={20} size={2} />
                <Controls className="bg-surface border-slate-700 fill-white border rounded-lg shadow-xl" />
                <MiniMap
                    nodeColor={(n) => n.style?.borderColor || '#64748b'}
                    className="bg-surface/90 border-slate-700 rounded-lg shadow-xl !bottom-12 !right-12"
                    maskColor="rgba(15, 23, 42, 0.8)"
                />

                {/* Top Panel: Actions */}
                <Panel position="top-right" className="flex gap-2">
                    <button onClick={downloadImage} className="bg-surface/80 backdrop-blur border border-slate-700 p-2 rounded-lg text-white hover:bg-primary hover:border-primary transition-all shadow-lg" title="Download PNG">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={onToggleFullscreen} className="bg-surface/80 backdrop-blur border border-slate-700 p-2 rounded-lg text-white hover:bg-primary hover:border-primary transition-all shadow-lg" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </Panel>

                {/* Top Left Panel: Settings */}
                <Panel position="top-left" className="bg-surface/90 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-2xl m-4 space-y-4 w-64">
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <LayoutIcon className="w-3 h-3" /> Layout
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setLayout('tree')}
                                className={clsx("px-3 py-1.5 text-xs rounded-md border transition-all", layout === 'tree' ? "bg-primary/20 border-primary text-primary" : "bg-slate-800 border-transparent text-slate-400 hover:border-slate-600")}
                            >
                                Tree
                            </button>
                            <button
                                onClick={() => setLayout('radial')}
                                className={clsx("px-3 py-1.5 text-xs rounded-md border transition-all", layout === 'radial' ? "bg-primary/20 border-primary text-primary" : "bg-slate-800 border-transparent text-slate-400 hover:border-slate-600")}
                            >
                                Radial
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Palette className="w-3 h-3" /> Color Theme
                        </h4>
                        <div className="space-y-1">
                            <button
                                onClick={() => setTheme('fileType')}
                                className={clsx("w-full text-left px-3 py-1.5 text-xs rounded-md border transition-all flex items-center gap-2", theme === 'fileType' ? "bg-primary/20 border-primary text-primary" : "bg-slate-800 border-transparent text-slate-400 hover:border-slate-600")}
                            >
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-yellow-500"></div>
                                File Type
                            </button>
                            <button
                                onClick={() => setTheme('depth')}
                                className={clsx("w-full text-left px-3 py-1.5 text-xs rounded-md border transition-all flex items-center gap-2", theme === 'depth' ? "bg-primary/20 border-primary text-primary" : "bg-slate-800 border-transparent text-slate-400 hover:border-slate-600")}
                            >
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-200"></div>
                                Depth Level
                            </button>
                            <button
                                onClick={() => setTheme('default')}
                                className={clsx("w-full text-left px-3 py-1.5 text-xs rounded-md border transition-all flex items-center gap-2", theme === 'default' ? "bg-primary/20 border-primary text-primary" : "bg-slate-800 border-transparent text-slate-400 hover:border-slate-600")}
                            >
                                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                Standard
                            </button>
                        </div>
                    </div>
                </Panel>

                {/* Bottom Left: Legend */}
                <Panel position="bottom-left" className="bg-surface/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl m-4 text-xs space-y-2">
                    <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                        <Info className="w-3 h-3 text-primary" /> Legend
                    </h4>
                    {theme === 'fileType' && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-slate-800 border border-blue-500 block"></span>
                                <span className="text-slate-400">TypeScript</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-slate-800 border border-yellow-400 block"></span>
                                <span className="text-slate-400">JavaScript</span>
                            </div>
                        </>
                    )}
                    {theme === 'depth' && (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-16 bg-gradient-to-r from-blue-600 to-blue-200 rounded"></div>
                            <span className="text-slate-400">Root → Deep</span>
                        </div>
                    )}
                </Panel>
            </ReactFlow>
        </div>
    );
}

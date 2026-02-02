import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, File, ChevronRight, FileJson, FileType, FileImage } from 'lucide-react';
import type { FileNode } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileExplorerProps {
    node: FileNode;
    onSelect?: (node: FileNode) => void;
    selectedPath?: string;
    depth?: number;
}

export function FileExplorer({ node, onSelect, selectedPath, depth = 0 }: FileExplorerProps) {
    const [isOpen, setIsOpen] = useState(depth === 0);

    const isFolder = node.type === 'dir';
    const isSelected = selectedPath === node.path;
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder) {
            setIsOpen(!isOpen);
        }
        if (onSelect) {
            onSelect(node);
        }
    };

    const getIcon = () => {
        if (isFolder) {
            return isOpen ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-primary/80" />;
        }
        const name = node.name.toLowerCase();
        if (name.endsWith('.tsx') || name.endsWith('.jsx')) return <FileCode className="w-4 h-4 text-blue-400" />;
        if (name.endsWith('.ts') || name.endsWith('.js')) return <FileCode className="w-4 h-4 text-yellow-400" />;
        if (name.endsWith('.css') || name.endsWith('.scss')) return <FileType className="w-4 h-4 text-pink-400" />;
        if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-orange-400" />;
        if (name.endsWith('.md')) return <File className="w-4 h-4 text-slate-300" />;
        if (name.match(/\.(jpg|jpeg|png|svg|gif)$/)) return <FileImage className="w-4 h-4 text-purple-400" />;
        return <File className="w-4 h-4 text-slate-500" />;
    };

    return (
        <div className="select-none font-medium">
            <div
                className={twMerge(
                    "flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-all duration-200 rounded-lg group",
                    isSelected ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "hover:bg-surface/80 text-slate-400 hover:text-slate-200"
                )}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={handleToggle}
            >
                <span className="opacity-70 w-4 transition-transform duration-200">
                    {isFolder && hasChildren && (
                        <div className={clsx("transition-transform duration-200", isOpen && "rotate-90")}>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    )}
                </span>
                <span className="transition-colors duration-200 group-hover:scale-110">
                    {getIcon()}
                </span>
                <span className="truncate text-sm tracking-wide">{node.name}</span>
            </div>

            <div className={clsx("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                {hasChildren && (
                    <div className="border-l border-slate-700/30 ml-[19px]">
                        {node.children!.map((child) => (
                            <FileExplorer
                                key={child.path}
                                node={child}
                                onSelect={onSelect}
                                selectedPath={selectedPath}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

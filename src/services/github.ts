import { Octokit } from "octokit";
import type { FileNode, RepoDetails } from "../types";

const octokit = new Octokit();

export const fetchRepoDetails = async (owner: string, repo: string): Promise<RepoDetails> => {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
        owner,
        repo,
    });

    return {
        owner: data.owner.login,
        name: data.name,
        description: data.description || "",
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language || "Unknown",
        default_branch: data.default_branch,
    };
};

export const fetchRepoStructure = async (owner: string, repo: string, branch: string = "main"): Promise<FileNode> => {
    // Use the recursive tree API
    // GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1

    // First get the ref to get the latest commit sha
    const { data: refData } = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
        owner,
        repo,
        ref: branch,
    });

    const treeSha = refData.commit.tree.sha;

    const { data: treeData } = await octokit.request("GET /repos/{owner}/{repo}/git/trees/{tree_sha}", {
        owner,
        repo,
        tree_sha: treeSha,
        recursive: "1",
    });

    // Build the tree
    const root: FileNode = {
        name: repo,
        path: "",
        type: "dir",
        children: [],
    };

    const pathMap = new Map<string, FileNode>();
    pathMap.set("", root);

    // The tree API returns a flat list of path objects
    // We need to reconstruct the hierarchy
    // Ensure we sort by path length to process parents first? No, path 'src/foo' implies 'src'.
    // But the API results often come sorted or in a way we can handle.

    // Actually, we should iterate and create nodes.
    // We need to handle nested paths like 'src/components/Header.tsx'

    treeData.tree.forEach((item) => {
        if (!item.path) return;

        // Split path into parts
        const parts = item.path.split("/");
        // const fileName = parts.pop()!; // last part
        // Using simpler logic to keep linter happy for now and assume consistent paths
        const fileName = parts[parts.length - 1];

        const node: FileNode = {
            name: fileName,
            path: item.path,
            type: item.type === "blob" ? "file" : "dir",
            size: item.size,
            url: item.url,
            children: item.type === "tree" ? [] : undefined,
        };

        pathMap.set(item.path, node);
    });

    // Link nodes
    treeData.tree.forEach((item) => {
        if (!item.path || item.path === "") return;

        const parts = item.path.split("/");
        parts.pop();
        const dirPath = parts.join("/"); // if empty string, parent is root

        const node = pathMap.get(item.path)!;
        const parent = pathMap.get(dirPath);

        if (parent && parent.children) {
            parent.children.push(node);
        }
    });

    return root;
};

export const fetchFileContent = async (owner: string, repo: string, path: string): Promise<string | null> => {
    try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo,
            path,
        });

        const contentData = data as any;
        if (Array.isArray(contentData) || !contentData.content) {
            return null;
        }

        // Content is base64 encoded
        return atob(contentData.content);
    } catch (error) {
        console.warn(`Failed to fetch content for ${path}`, error);
        return null;
    }
};

import { env } from '$env/dynamic/private';
import { CRATES, GITHUB_REPOS } from '$lib/config';
import type { PageServerLoad } from './$types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CrateInfo {
    version: string;
    downloads: number;
    recent_downloads: number;
    description: string;
    repository: string | null;
    documentation: string | null;
    homepage: string | null;
    license: string | null;
    keywords: string[];
    categories: string[];
    crate_size: number | null;
    rust_lines: number | null;
    rust_files: number | null;
    created_at: string;
    updated_at: string;
}

interface GitHubInfo {
    stars: number;
    forks: number;
    open_issues: number;
    description: string;
    url: string;
    license: string | null;
    language: string;
    topics: string[];
}

function extractGitHubSlug(url: string | null): string | null {
    if (!url) return null;
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1].replace(/\.git$/, '') : null;
}

export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => {
    const cratesData: Record<string, CrateInfo> = {};
    const githubData: Record<string, GitHubInfo> = {};

    console.log("=== Hydrating Sovereign Exhibit ===");

    const ghHeaders: Record<string, string> = {};
    if (env.GITHUB_TOKEN) {
        ghHeaders['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
    }

    // 1. Fetch GitHub Data for known repos
    for (const repo of GITHUB_REPOS) {
        try {
            const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders });
            if (res.ok) {
                const data = await res.json();
                githubData[repo] = {
                    stars: data.stargazers_count,
                    forks: data.forks_count,
                    open_issues: data.open_issues_count,
                    description: data.description,
                    url: data.html_url,
                    license: data.license?.spdx_id || null,
                    language: data.language,
                    topics: data.topics || []
                };
            }
        } catch (e) {
            console.error(`Failed to fetch GitHub repo ${repo}:`, e);
        }
    }

    // 2. Fetch Crates.io Data (Throttled!)
    for (const crate of CRATES) {
        try {
            const res = await fetch(`https://crates.io/api/v1/crates/${crate}`, {
                headers: { 'User-Agent': 'TheJanusStream-Portfolio-Builder (github.com/TheJanusStream)' }
            });
            if (res.ok) {
                const data = await res.json();
                const latestVersion = data.versions?.[0];
                const linecounts = latestVersion?.linecounts?.languages?.Rust;

                cratesData[crate] = {
                    version: data.crate.max_version,
                    downloads: data.crate.downloads,
                    recent_downloads: data.crate.recent_downloads,
                    description: data.crate.description,
                    repository: data.crate.repository,
                    documentation: data.crate.documentation,
                    homepage: data.crate.homepage,
                    license: latestVersion?.license || null,
                    keywords: (data.keywords || []).map((k: { keyword: string }) => k.keyword),
                    categories: (data.categories || []).map((c: { category: string }) => c.category),
                    crate_size: latestVersion?.crate_size || null,
                    rust_lines: linecounts?.code_lines || null,
                    rust_files: linecounts?.files || null,
                    created_at: data.crate.created_at,
                    updated_at: data.crate.updated_at
                };
            }
            await delay(1100);
        } catch (e) {
            console.error(`Failed to fetch crate ${crate}:`, e);
        }
    }

    // 3. Fetch GitHub data for any repos discovered from crates that we haven't fetched yet
    const discoveredRepos = new Set<string>();
    for (const crate of Object.values(cratesData)) {
        const slug = extractGitHubSlug(crate.repository);
        if (slug && !githubData[slug]) {
            discoveredRepos.add(slug);
        }
    }

    for (const repo of discoveredRepos) {
        try {
            const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders });
            if (res.ok) {
                const data = await res.json();
                githubData[repo] = {
                    stars: data.stargazers_count,
                    forks: data.forks_count,
                    open_issues: data.open_issues_count,
                    description: data.description,
                    url: data.html_url,
                    license: data.license?.spdx_id || null,
                    language: data.language,
                    topics: data.topics || []
                };
            }
        } catch (e) {
            console.error(`Failed to fetch discovered GitHub repo ${repo}:`, e);
        }
    }

    console.log("=== Hydration Complete ===");

    return {
        crates: cratesData,
        github: githubData
    };
};

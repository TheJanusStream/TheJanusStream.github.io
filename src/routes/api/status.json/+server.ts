import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { CRATES, GITHUB_REPOS } from '$lib/config';

// Tell SvelteKit to bake this endpoint into a static file at build time
export const prerender = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
    const cratesData: Record<string, any> = {};
    const githubData: Record<string, any> = {};

    console.log("=== API: Hydrating status.json ===");

    // 1. Fetch GitHub Data
    const ghHeaders = env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {};
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
                    topics: data.topics || [],
                    updated_at: data.updated_at
                };
            }
        } catch (e) {
            console.error(`API: Failed to fetch GitHub repo ${repo}:`, e);
        }
    }

    // 2. Fetch Crates.io Data (Throttled to 1 req/sec)
    for (const crate of CRATES) {
        try {
            const res = await fetch(`https://crates.io/api/v1/crates/${crate}`, {
                headers: { 'User-Agent': 'TheJanusStream-API-Builder (github.com/TheJanusStream)' }
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
            console.error(`API: Failed to fetch crate ${crate}:`, e);
        }
    }

    return json({
        generated_at: new Date().toISOString(),
        ecosystem: {
            crates: cratesData,
            repositories: githubData
        }
    });
}
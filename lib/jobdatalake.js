import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const JOBDATALAKE_MCP_URL = 'https://mcp.jobdatalake.com/sse';
const UPSTREAM_SOURCE = 'https://mcp.jobdatalake.com';

let activeClient = null;
let activeTransport = null;
let isConnecting = null;

/**
 * Acquire a connected MCP client to JobDataLake
 */
async function getUpstreamClient() {
  if (activeClient) {
    return activeClient;
  }
  if (isConnecting) {
    return isConnecting;
  }

  isConnecting = (async () => {
    try {
      const transport = new SSEClientTransport(new URL(JOBDATALAKE_MCP_URL));
      const client = new Client(
        { name: 'career-navigator-bridge', version: '1.0.0' },
        { capabilities: {} }
      );

      // Handle close
      transport.onclose = () => {
        activeClient = null;
        activeTransport = null;
      };
      transport.onerror = () => {
        activeClient = null;
        activeTransport = null;
      };

      await client.connect(transport);
      activeClient = client;
      activeTransport = transport;
      return client;
    } finally {
      isConnecting = null;
    }
  })();

  return isConnecting;
}

/**
 * Execute tool on upstream MCP server with retries and timeout
 */
export async function callUpstreamTool(toolName, args = {}) {
  const timeoutMs = 12000;
  let client;

  try {
    client = await Promise.race([
      getUpstreamClient(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection to JobDataLake timed out')), timeoutMs)
      ),
    ]);

    const result = await Promise.race([
      client.callTool({ name: toolName, arguments: args }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('JobDataLake request timed out')), timeoutMs)
      ),
    ]);

    return result;
  } catch (err) {
    // Invalidate cached client on error so next call reconnects fresh
    if (activeTransport) {
      try {
        await activeTransport.close();
      } catch (closeErr) {
        // ignore
      }
    }
    activeClient = null;
    activeTransport = null;
    throw err;
  }
}

/**
 * Parse structured jobs from JobDataLake text response
 */
export function parseJobsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const jobs = [];
  const lines = text.split('\n');
  let currentJob = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const matchHeader = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s+at\s+(.+)$/);
    if (matchHeader) {
      if (currentJob) jobs.push(currentJob);
      currentJob = {
        title: matchHeader[1].trim(),
        company: matchHeader[2].trim(),
        location: 'Not specified',
        remote_type: 'Not specified',
        salary: 'Not disclosed',
        skills: [],
        apply_url: '',
        job_id: ''
      };
      continue;
    }

    if (!currentJob) continue;

    if (line.startsWith('Apply:')) {
      currentJob.apply_url = line.replace('Apply:', '').trim();
    } else if (line.startsWith('ID:')) {
      currentJob.job_id = line.replace('ID:', '').trim();
    } else if (line.startsWith('Skills:')) {
      const skillsStr = line.replace('Skills:', '').trim();
      currentJob.skills = skillsStr
        ? skillsStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    } else if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts[0]) currentJob.location = parts[0];
      if (parts[1]) currentJob.remote_type = parts[1];
      if (parts[2]) currentJob.salary = parts[2];
    }
  }
  if (currentJob) jobs.push(currentJob);
  return jobs;
}

/**
 * Shared function for JobDataLake_search_jobs
 */
export async function searchJobs(params = {}) {
  const cleanArgs = {};
  const allowedKeys = [
    'page',
    'query',
    'skills',
    'company',
    'sort_by',
    'location',
    'per_page',
    'countries',
    'seniority',
    'salary_max',
    'salary_min',
    'remote_type',
    'job_function',
    'posted_within',
    'semantic_query',
    'employment_type',
  ];

  for (const key of allowedKeys) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanArgs[key] = params[key];
    }
  }

  // Ensure query or semantic_query has a fallback
  if (!cleanArgs.query && !cleanArgs.semantic_query) {
    cleanArgs.query = '*';
  }

  // Max 20 items per requirement
  cleanArgs.per_page = Math.min(Number(cleanArgs.per_page) || 20, 20);

  const upstreamRes = await callUpstreamTool('search_jobs', cleanArgs);
  const text = upstreamRes?.content?.[0]?.text || '';
  const parsedItems = parseJobsFromText(text).slice(0, 20);

  return {
    source: UPSTREAM_SOURCE,
    fetched_at: new Date().toISOString(),
    items: parsedItems,
    count: parsedItems.length,
    raw: text,
  };
}

/**
 * Shared function for JobDataLake_get_job
 */
export async function getJob(params = {}) {
  const jobId = params.job_id || params.id;
  if (!jobId) {
    throw new Error('Missing required parameter job_id');
  }

  const upstreamRes = await callUpstreamTool('get_job', { job_id: jobId });
  const text = upstreamRes?.content?.[0]?.text || '';

  return {
    source: UPSTREAM_SOURCE,
    fetched_at: new Date().toISOString(),
    job_id: jobId,
    details: text,
  };
}

/**
 * Shared function for JobDataLake_get_company
 */
export async function getCompany(params = {}) {
  const company = params.company;
  if (!company) {
    throw new Error('Missing required parameter company');
  }

  const upstreamRes = await callUpstreamTool('get_company', { company });
  const text = upstreamRes?.content?.[0]?.text || '';

  return {
    source: UPSTREAM_SOURCE,
    fetched_at: new Date().toISOString(),
    company,
    details: text,
  };
}

/**
 * Shared function for JobDataLake_find_similar_jobs
 */
export async function findSimilarJobs(params = {}) {
  const jobId = params.job_id || params.id;
  if (!jobId) {
    throw new Error('Missing required parameter job_id');
  }
  const perPage = Math.min(Number(params.per_page) || 10, 20);

  const upstreamRes = await callUpstreamTool('find_similar_jobs', {
    job_id: jobId,
    per_page: perPage,
  });
  const text = upstreamRes?.content?.[0]?.text || '';
  const parsedItems = parseJobsFromText(text).slice(0, 20);

  return {
    source: UPSTREAM_SOURCE,
    fetched_at: new Date().toISOString(),
    items: parsedItems,
    count: parsedItems.length,
    raw: text,
  };
}

/**
 * Shared function for JobDataLake_get_filter_options
 */
export async function getFilterOptions(params = {}) {
  const facets =
    params.facets ||
    'seniority,job_function,remote_type,employment_type,required_skills';

  const upstreamRes = await callUpstreamTool('get_filter_options', { facets });
  const text = upstreamRes?.content?.[0]?.text || '';

  return {
    source: UPSTREAM_SOURCE,
    fetched_at: new Date().toISOString(),
    facets,
    details: text,
  };
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import {
  searchJobs,
  getJob,
  getCompany,
  findSimilarJobs,
  getFilterOptions,
} from '../lib/jobdatalake.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed' },
      id: null,
    });
    return;
  }

  const server = new McpServer({ name: 'career-server', version: '1.0.0' });

  // 1. career_search_jobs
  server.registerTool(
    'career_search_jobs',
    {
      description:
        'Returns up to 20 matching live job postings including titles, companies, locations, salary bounds, and requirements. It is read from the upstream JobDataLake MCP service (https://mcp.jobdatalake.com). Use this tool when exploring employment demand, filtering vacancies by skill or geography, or analyzing market salaries. It does not provide applicant tracking or direct resume submission.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        page: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Page number for pagination, starting from 1'),
        query: z
          .string()
          .optional()
          .describe("Keyword search covering job title, company name, or skills. Use '*' for all jobs."),
        skills: z
          .string()
          .optional()
          .describe("Comma-separated required skills, e.g. 'Python,AWS,Kubernetes'"),
        company: z
          .string()
          .optional()
          .describe("Company domain filter, e.g. 'stripe.com' or company handle"),
        sort_by: z
          .string()
          .optional()
          .describe(
            "Sort order such as 'posted_at:desc', 'posted_at:asc', 'salary_max_usd:desc', or 'salary_min_usd:asc'"
          ),
        location: z
          .string()
          .optional()
          .describe("Location filter string, e.g. 'Remote', 'London', 'San Francisco'"),
        per_page: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Number of results to return per page, up to 100'),
        countries: z
          .string()
          .optional()
          .describe("Comma-separated ISO country codes, e.g. 'US,GB,DE'"),
        seniority: z
          .string()
          .optional()
          .describe(
            'Comma-separated seniority levels: Entry, Mid Level, Senior, Staff, Principal, Manager, Internship, Director, Lead, C Level'
          ),
        salary_max: z.number().optional().describe('Maximum annual salary in USD'),
        salary_min: z.number().optional().describe('Minimum annual salary in USD'),
        remote_type: z
          .enum(['fully_remote', 'hybrid', 'on_site'])
          .optional()
          .describe('Remote work policy preference: fully_remote, hybrid, or on_site'),
        job_function: z
          .enum([
            'eng',
            'data',
            'design',
            'sales',
            'ops',
            'marketing',
            'security',
            'product',
            'finance',
            'hr',
            'legal',
            'other',
          ])
          .optional()
          .describe('Job functional category domain'),
        posted_within: z
          .string()
          .optional()
          .describe("Posting time window: '24h', '7d', '30d' to filter recently posted vacancies"),
        semantic_query: z
          .string()
          .optional()
          .describe("AI semantic search query, e.g. 'machine learning engineer' or 'senior devops'"),
        employment_type: z
          .enum(['full_time', 'part_time', 'contract', 'internship'])
          .optional()
          .describe('Employment contract type: full_time, part_time, contract, internship'),
      },
    },
    async (args) => {
      try {
        const result = await searchJobs(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to search jobs from JobDataLake upstream: ${err.message || 'upstream connection failure (500)'}`,
            },
          ],
        };
      }
    }
  );

  // 2. career_get_job
  server.registerTool(
    'career_get_job',
    {
      description:
        'Returns detailed specifications, full description, qualifications, and apply link for a specific job posting. It is read from the upstream JobDataLake MCP service (https://mcp.jobdatalake.com). Use this tool when you have a specific job handle and need in-depth role expectations and employer criteria. It does not cover internal hiring team contact details or interview status.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        job_id: z
          .string()
          .describe("Job handle ID from search results, e.g. 'dropbox-senior-full-stack-software-engineer-d3f1k'"),
      },
    },
    async (args) => {
      try {
        const result = await getJob(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to retrieve job details from JobDataLake upstream: ${err.message || 'upstream error (404/500)'}`,
            },
          ],
        };
      }
    }
  );

  // 3. career_get_company
  server.registerTool(
    'career_get_company',
    {
      description:
        'Returns an employer profile including industry classification, estimated workforce size, active listing counts, and career portal link. It is read from the upstream JobDataLake MCP service (https://mcp.jobdatalake.com). Use this tool to research hiring organizations, firm domain footprints, or open headcount across departments. It does not provide private revenue figures or internal organizational charts.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        company: z
          .string()
          .describe("Company domain (e.g. 'stripe.com') or company handle"),
      },
    },
    async (args) => {
      try {
        const result = await getCompany(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to retrieve company profile from JobDataLake upstream: ${err.message || 'upstream error (404/500)'}`,
            },
          ],
        };
      }
    }
  );

  // 4. career_find_similar_jobs
  server.registerTool(
    'career_find_similar_jobs',
    {
      description:
        'Returns a list of related job listings identified through AI vector similarity based on role requirements and skill adjacencies. It is read from the upstream JobDataLake MCP service (https://mcp.jobdatalake.com). Use this tool to discover adjacent career paths, alternative openings, or comparable roles across industries. It does not calculate candidate fit scores or verify user qualifications.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        job_id: z
          .string()
          .describe("Job handle ID from search results to find similar positions for"),
        per_page: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Number of similar jobs to retrieve, defaults to 10'),
      },
    },
    async (args) => {
      try {
        const result = await findSimilarJobs(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to find similar jobs from JobDataLake upstream: ${err.message || 'upstream error (404/500)'}`,
            },
          ],
        };
      }
    }
  );

  // 5. career_get_filter_options
  server.registerTool(
    'career_get_filter_options',
    {
      description:
        'Returns valid facet categories, available taxonomy values, and current vacancy counts across dimensions like seniority, functions, and remote types. It is read from the upstream JobDataLake MCP service (https://mcp.jobdatalake.com). Use this tool to discover filter choices before executing targeted job searches. It does not retrieve individual job records or historic trend charts.',
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: {
        facets: z
          .string()
          .optional()
          .describe(
            "Comma-separated facet fields to retrieve, e.g. 'seniority,job_function,remote_type,employment_type,required_skills'"
          ),
      },
    },
    async (args) => {
      try {
        const result = await getFilterOptions(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to retrieve filter options from JobDataLake upstream: ${err.message || 'upstream error (500)'}`,
            },
          ],
        };
      }
    }
  );

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', async () => {
    try {
      await transport.close();
      await server.close();
    } catch (e) {
      // safe ignore
    }
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}

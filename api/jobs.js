import { searchJobs } from '../lib/jobdatalake.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const result = await searchJobs(params || {});
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to search jobs' });
  }
}

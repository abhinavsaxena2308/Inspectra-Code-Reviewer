import { pool } from './db';
import crypto from 'crypto';

export const createPendingAnalysis = async (repoUrl: string, owner: string, repoName: string, userId: string): Promise<string | null> => {
  const repoId = crypto.randomUUID();
  const analysisId = crypto.randomUUID();
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if repo exists for this user, if so, we can just use it, or we insert a new one. 
    // To keep it simple, we'll always insert a new repo entry for each analysis, or use upsert.
    // Let's just insert a new repo record (repoId is unique) to avoid complex logic.
    await client.query(
      `INSERT INTO repositories (id, repo_url, owner, repo_name, clerk_user_id) 
       VALUES ($1, $2, $3, $4, $5)`,
      [repoId, repoUrl, owner, repoName, userId]
    );

    await client.query(
      `INSERT INTO analyses (id, repo_id, status, clerk_user_id) 
       VALUES ($1, $2, $3, $4)`,
      [analysisId, repoId, 'pending', userId]
    );

    await client.query('COMMIT');
    console.log(`[Storage] Created pending analysis: ${analysisId}`);
    return analysisId;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[Storage] Error creating pending analysis:', error);
    throw new Error(`DB Error: ${error.message || error}`);
  } finally {
    client.release();
  }
};

export const updateAnalysisStatus = async (analysisId: string, status: 'processing' | 'completed' | 'failed', errorMessage?: string): Promise<void> => {
  try {
    await pool.query(
      `UPDATE analyses SET status = $1 WHERE id = $2`,
      [status, analysisId]
    );
    console.log(`[Storage] Updated analysis ${analysisId} status to ${status}`);
  } catch (error) {
    console.error('[Storage] Error updating analysis status:', error);
  }
};

export const saveAnalysisIssues = async (analysisId: string, issues: any[], score: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      `UPDATE analyses SET score = $1 WHERE id = $2`,
      [score, analysisId]
    );

    const flatIssues = issues.flatMap(f => (f.issues || []).map((i: any) => ({
      ...i,
      file_name: f.file
    })));

    for (const issue of flatIssues) {
      await client.query(
        `INSERT INTO issues (analysis_id, file_name, type, severity, message, suggestion, line_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [analysisId, issue.file_name, issue.type || 'bug', issue.severity || 'low', issue.message, issue.suggestion, issue.line || null]
      );
    }

    await client.query('COMMIT');
    console.log(`[Storage] Saved ${flatIssues.length} issues for ${analysisId} with score ${score}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Storage] Error saving analysis issues:', error);
  } finally {
    client.release();
  }
};

export const getAnalysis = async (id: string, userId: string) => {
  try {
    const analysisRes = await pool.query(
      `SELECT a.*, r.owner, r.repo_name, r.repo_url 
       FROM analyses a
       JOIN repositories r ON a.repo_id = r.id
       WHERE a.id = $1 AND a.clerk_user_id = $2`,
      [id, userId]
    );

    if (analysisRes.rows.length === 0) return null;
    const analysis = analysisRes.rows[0];

    const issuesRes = await pool.query(
      `SELECT * FROM issues WHERE analysis_id = $1`,
      [id]
    );

    return {
      id: analysis.id,
      status: analysis.status,
      score: analysis.score,
      created_at: analysis.created_at,
      repositories: {
        owner: analysis.owner,
        repo_name: analysis.repo_name,
        repo_url: analysis.repo_url
      },
      issues: issuesRes.rows
    };
  } catch (error) {
    console.error('[Storage] Error fetching analysis:', error);
    return null;
  }
};

export const getUserRepositories = async (userId: string) => {
  try {
    const res = await pool.query(
      `SELECT r.id, r.repo_url, r.owner, r.repo_name, r.created_at, 
              a.id as analysis_id, a.score, a.status, a.created_at as last_analyzed
       FROM repositories r
       LEFT JOIN analyses a ON r.id = a.repo_id
       WHERE r.clerk_user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return res.rows;
  } catch (error) {
    console.error('[Storage] Error fetching user repos:', error);
    return [];
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const res = await pool.query(
      `SELECT COUNT(*) as total, AVG(score) as avg_score 
       FROM analyses 
       WHERE clerk_user_id = $1 AND status = 'completed'`,
      [userId]
    );
    const issuesRes = await pool.query(
      `SELECT COUNT(*) as total_issues 
       FROM issues i 
       JOIN analyses a ON i.analysis_id = a.id 
       WHERE a.clerk_user_id = $1`,
      [userId]
    );
    
    return {
      total: parseInt(res.rows[0].total) || 0,
      avg_score: Math.round(parseFloat(res.rows[0].avg_score)) || 0,
      issues: parseInt(issuesRes.rows[0].total_issues) || 0
    };
  } catch (error) {
    console.error('[Storage] Error fetching stats:', error);
    return { total: 0, avg_score: 0, issues: 0 };
  }
};

export const getUserActivity = async (userId: string) => {
  try {
    const res = await pool.query(
      `SELECT a.id, a.status, a.created_at, r.repo_name
       FROM analyses a
       JOIN repositories r ON a.repo_id = r.id
       WHERE a.clerk_user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [userId]
    );
    return res.rows;
  } catch (error) {
    console.error('[Storage] Error fetching activity:', error);
    return [];
  }
};

export const getHistoryStats = async (userId: string) => {
  try {
    const res = await pool.query(
      `SELECT 
         COUNT(*) as total_runs,
         SUM(CASE WHEN status = 'completed' AND score >= 60 THEN 1 ELSE 0 END) as successful_runs,
         AVG(score) as avg_score
       FROM analyses
       WHERE clerk_user_id = $1`,
      [userId]
    );
    
    const row = res.rows[0];
    const totalRuns = parseInt(row.total_runs) || 0;
    const successfulRuns = parseInt(row.successful_runs) || 0;
    const avgScore = Math.round(parseFloat(row.avg_score)) || 0;
    const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;

    return { totalRuns, successRate, avgScore };
  } catch (error) {
    console.error('[Storage] Error fetching history stats:', error);
    return { totalRuns: 0, successRate: 0, avgScore: 0 };
  }
};

export const getHistoryList = async (userId: string) => {
  try {
    const res = await pool.query(
      `SELECT a.id, a.status, a.score, a.created_at, r.owner, r.repo_name
       FROM analyses a
       JOIN repositories r ON a.repo_id = r.id
       WHERE a.clerk_user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return res.rows;
  } catch (error) {
    console.error('[Storage] Error fetching history list:', error);
    return [];
  }
};

import { createClient } from '@insforge/sdk';
import { config } from '../config';

let _client: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> | null {
  if (_client) return _client;

  const url = config.insforgeUrl;
  const key = config.insforgeAnonKey;

  if (!url || !key) {
    console.warn('[Storage] InsForge credentials missing. Data persistence will be disabled.');
    return null;
  }

  _client = createClient({ baseUrl: url, anonKey: key });
  console.log('[Storage] InsForge client initialized.');
  return _client;
}

export const createPendingAnalysis = async (repoUrl: string, owner: string, repoName: string): Promise<string | null> => {
  const client = getClient();
  if (!client) {
    console.warn('[Storage] Cannot create pending analysis: InsForge client not initialized.');
    return null;
  }

  try {
    // 1. Ensure Repository exists
    const { data: repo, error: repoError } = await client.database
      .from('repositories')
      .select('id')
      .eq('repo_url', repoUrl)
      .single();

    let repoId;
    if (repoError && repoError.code === 'PGRST116') {
      const { data: newRepo, error: insertError } = await client.database
        .from('repositories')
        .insert([{ repo_url: repoUrl, owner, repo_name: repoName }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      repoId = newRepo.id;
    } else if (repoError) {
      throw repoError;
    } else {
      repoId = repo.id;
    }

    // 2. Insert Pending Analysis
    const { data: analysis, error: analysisError } = await client.database
      .from('analyses')
      .insert([{ repo_id: repoId, status: 'pending' }])
      .select()
      .single();
    
    if (analysisError) throw analysisError;
    return analysis.id;
  } catch (error: any) {
    console.error('[Storage] Error creating pending analysis:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to create pending analysis: ${error.message ?? String(error)}`);
  }
};

export const updateAnalysisStatus = async (analysisId: string, status: 'processing' | 'completed' | 'failed', errorMessage?: string): Promise<void> => {
  const client = getClient();
  if (!client) {
    console.warn('[Storage] Cannot update analysis status: InsForge client not initialized.');
    return;
  }

  try {
    const { error } = await client.database
      .from('analyses')
      .update({ status: status })
      .eq('id', analysisId);

    if (error) throw error;
  } catch (error: any) {
    console.error(`[Storage] Failed to update analysis ${analysisId} status to ${status}:`, error);
  }
};

export const saveAnalysisIssues = async (analysisId: string, issues: any[]): Promise<void> => {
  const client = getClient();
  if (!client) {
    console.warn('[Storage] Cannot save issues: InsForge client not initialized.');
    return;
  }

  try {
    if (issues && issues.length > 0) {
      const issuesToInsert: any[] = [];
      
      for (const fileAnalysis of issues) {
        if (fileAnalysis.issues && Array.isArray(fileAnalysis.issues)) {
          for (const issue of fileAnalysis.issues) {
            issuesToInsert.push({
              analysis_id: analysisId,
              file_name: fileAnalysis.file || 'unknown',
              severity: issue.severity || 'info',
              message: issue.message || 'No description',
              suggestion: issue.suggestion || ''
            });
          }
        }
      }

      if (issuesToInsert.length > 0) {
        const { error: issuesError } = await client.database
          .from('issues')
          .insert(issuesToInsert);
        
        if (issuesError) throw issuesError;
      }
    }
  } catch (error: any) {
    console.error('[Storage] Error saving analysis issues:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to save analysis issues: ${error.message ?? String(error)}`);
  }
};
export const getAnalysis = async (id: string) => {
  const client = getClient();
  if (!client) {
    console.warn('[Storage] Cannot fetch analysis: InsForge client not initialized.');
    return null;
  }

  const { data: result, error } = await client.database
    .from('analyses')
    .select(`
      *,
      repositories (repo_url, owner, repo_name),
      issues (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch analysis from InsForge: ${error.message}`);
  }

  return result;
};

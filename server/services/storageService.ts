import { createClient } from '@insforge/sdk';
import '../config';

let _client: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> | null {
  if (_client) return _client;

  const url = process.env.VITE_INSFORGE_URL;
  const key = process.env.VITE_INSFORGE_ANON_KEY;

  if (!url || !key) {
    console.warn('[Storage] InsForge credentials missing. Data persistence will be disabled.');
    return null;
  }

  _client = createClient({ baseUrl: url, anonKey: key });
  console.log('[Storage] InsForge client initialized.');
  return _client;
}

export const saveAnalysis = async (data: {
    repoUrl: string;
    owner: string;
    repoName: string;
    issues: any[];
}) => {
  const client = getClient();
  if (!client) {
    console.warn('[Storage] Cannot save analysis: InsForge client not initialized.');
    return null;
  }

  try {
    // 1. Ensure Repository exists
    const { data: repo, error: repoError } = await client.database
      .from('repositories')
      .select('id')
      .eq('repo_url', data.repoUrl)
      .single();

    let repoId;
    if (repoError && repoError.code === 'PGRST116') {
      // Not found, insert new
      const { data: newRepo, error: insertError } = await client.database
        .from('repositories')
        .insert([{
          repo_url: data.repoUrl,
          owner: data.owner,
          repo_name: data.repoName
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      repoId = newRepo.id;
    } else if (repoError) {
      throw repoError;
    } else {
      repoId = repo.id;
    }

    // 2. Insert Analysis
    const { data: analysis, error: analysisError } = await client.database
      .from('analyses')
      .insert([{
        repo_id: repoId,
        status: 'completed'
      }])
      .select()
      .single();
    
    if (analysisError) throw analysisError;
    const analysisId = analysis.id;

    // 3. Insert Issues
    if (data.issues && data.issues.length > 0) {
      const issuesToInsert: any[] = [];
      
      for (const fileAnalysis of data.issues) {
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

    return { analysisId, repoId };
  } catch (error: any) {
    console.error('[Storage] Save error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to save analysis to InsForge: ${error.message ?? String(error)}`);
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

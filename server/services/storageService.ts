// Mock Storage Service (InsForge removed)

interface MockAnalysis {
  id: string;
  repo_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  score?: number;
  created_at: string;
  repositories: any;
  issues: any[];
}

// In-memory store for development
const mockAnalyses: Record<string, MockAnalysis> = {};
const mockRepos: Record<string, any> = {};

export const createPendingAnalysis = async (repoUrl: string, owner: string, repoName: string): Promise<string | null> => {
  const repoId = `repo_${Date.now()}`;
  const analysisId = `analysis_${Date.now()}`;
  
  const repo = {
    id: repoId,
    repo_url: repoUrl,
    owner,
    repo_name: repoName,
    created_at: new Date().toISOString()
  };
  
  mockRepos[repoId] = repo;
  
  mockAnalyses[analysisId] = {
    id: analysisId,
    repo_id: repoId,
    status: 'pending',
    created_at: new Date().toISOString(),
    repositories: repo,
    issues: []
  };

  console.log(`[MockStorage] Created pending analysis: ${analysisId}`);
  return analysisId;
};

export const updateAnalysisStatus = async (analysisId: string, status: 'processing' | 'completed' | 'failed', errorMessage?: string): Promise<void> => {
  if (mockAnalyses[analysisId]) {
    mockAnalyses[analysisId].status = status;
    console.log(`[MockStorage] Updated analysis ${analysisId} status to ${status}`);
  }
};

export const saveAnalysisIssues = async (analysisId: string, issues: any[], score: number): Promise<void> => {
  if (mockAnalyses[analysisId]) {
    mockAnalyses[analysisId].score = score;
    mockAnalyses[analysisId].issues = issues.flatMap(f => (f.issues || []).map((i: any) => ({
      ...i,
      file_name: f.file,
      analysis_id: analysisId
    })));
    console.log(`[MockStorage] Saved ${issues.length} file analyses for ${analysisId} with score ${score}`);
  }
};

export const getAnalysis = async (id: string) => {
  console.log(`[MockStorage] Fetching analysis: ${id}`);
  return mockAnalyses[id] || null;
};

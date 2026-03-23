import axios from 'axios';

export interface AnalysisIssue {
  id: string;
  file_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
}

export interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  repo_id: string;
  created_at: string;
  issues?: AnalysisIssue[];
  error_message?: string;
  repository?: {
    repo_url: string;
    owner: string;
    repo_name: string;
  };
}

export interface AnalyzeResponse {
  status: 'success';
  data: {
    id: string;
    owner: string;
    repo: string;
    jobStatus: 'pending';
    message: string;
  };
}

export const analyzeRepository = async (repoUrl: string): Promise<AnalyzeResponse> => {
  const response = await axios.post<AnalyzeResponse>('/api/analyze', { repoUrl });
  return response.data;
};

export const getAnalysisStatus = async (id: string): Promise<{ status: 'success'; data: AnalysisResult }> => {
  const response = await axios.get<{ status: 'success'; data: AnalysisResult }>(`/api/status/${id}`);
  return response.data;
};

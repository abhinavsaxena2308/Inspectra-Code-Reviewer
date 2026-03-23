import axios from 'axios';

export interface AnalysisIssue {
  type: 'bug' | 'security' | 'performance' | 'suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
}

export interface FileAnalysis {
  file_name: string;
  issues: AnalysisIssue[];
}

export interface AnalysisResult {
  id: string;
  repo: string;
  score: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  files?: FileAnalysis[];
  created_at: string;
  error_message?: string;
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

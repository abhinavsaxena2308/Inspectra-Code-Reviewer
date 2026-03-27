import { analyzeCodeWithGemini, AnalysisIssue } from './geminiService';

export type { AnalysisIssue };

export interface FileAnalysis {
  file: string;
  issues: AnalysisIssue[];
}

const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx': return 'JavaScript';
    case 'ts':
    case 'tsx': return 'TypeScript';
    case 'py': return 'Python';
    case 'go': return 'Go';
    case 'java': return 'Java';
    case 'cpp':
    case 'cc':
    case 'h': return 'C++';
    case 'c': return 'C';
    case 'cs': return 'C#';
    case 'rb': return 'Ruby';
    case 'php': return 'PHP';
    case 'rs': return 'Rust';
    default: return 'Unknown';
  }
};

export const analyzeFile = async (
  filename: string, 
  content: string, 
  repoName: string = 'Unknown Repository'
): Promise<FileAnalysis> => {
  const language = getLanguageFromExtension(filename);
  
  try {
    const issues = await analyzeCodeWithGemini(repoName, filename, language, content);
    
    return {
      file: filename,
      issues,
    };
  } catch (error) {
    console.error(`[AnalysisService] Error analyzing ${filename}:`, error);
    return {
      file: filename,
      issues: [{
        type: 'quality',
        severity: 'low',
        message: 'Analysis failed for this file.',
        suggestion: 'The AI service might be temporarily unavailable or the file content too complex.'
      }],
    };
  }
};

export const analyzeMultipleFiles = async (
  files: { name: string; content: string }[],
  repoName: string = 'Unknown Repository'
): Promise<FileAnalysis[]> => {
  // Use sequential processing or limited concurrency to avoid Gemini rate limits
  const results: FileAnalysis[] = [];
  for (const file of files) {
    results.push(await analyzeFile(file.name, file.content, repoName));
    // Small delay between files to be safe
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return results;
};

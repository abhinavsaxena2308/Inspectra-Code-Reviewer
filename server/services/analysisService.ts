export interface AnalysisIssue {
  type: 'bug' | 'security' | 'quality' | 'suggestion' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  line?: number;
}

export interface FileAnalysis {
  file: string;
  issues: AnalysisIssue[];
}

export const analyzeFile = async (filename: string, content: string): Promise<FileAnalysis> => {
  const issues: AnalysisIssue[] = [];
  const lines = content.split('\n');

  // Rule-based Static Analysis
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 1. Bug: Non-strict equality
    if (line.includes(' == ') && !line.includes(' != ')) {
      issues.push({
        type: 'bug',
        severity: 'medium',
        message: 'Use of non-strict equality (==).',
        suggestion: 'Use strict equality (===) instead.',
        line: lineNum,
      });
    }

    // 2. Bug: Empty catch block
    if (line.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
      issues.push({
        type: 'bug',
        severity: 'high',
        message: 'Empty catch block found.',
        suggestion: 'Add error handling or logging to the catch block.',
        line: lineNum,
      });
    }

    // 3. Quality: Use of var
    if (line.match(/\bvar\b/)) {
      issues.push({
        type: 'quality',
        severity: 'low',
        message: 'Use of "var" keyword.',
        suggestion: 'Use "const" or "let" instead.',
        line: lineNum,
      });
    }

    // 4. Quality: leftover console.log
    if (line.includes('console.log(')) {
      issues.push({
        type: 'quality',
        severity: 'low',
        message: 'Leftover console.log statement.',
        suggestion: 'Remove console.log or use a proper logging library.',
        line: lineNum,
      });
    }

    // 5. Security: Potential Hardcoded Secrets
    const secretKeywords = ['API_KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'CREDENTIALS'];
    for (const keyword of secretKeywords) {
      if (line.includes(keyword) && (line.includes('=') || line.includes(':')) && !line.includes('process.env')) {
        issues.push({
          type: 'security',
          severity: 'high',
          message: `Potential hardcoded secret found: ${keyword}.`,
          suggestion: 'Store secrets in environment variables or a secure vault.',
          line: lineNum,
        });
      }
    }
  });

  // 6. Performance: File Size Check
  if (content.length > 50000) {
    issues.push({
      type: 'performance',
      severity: 'medium',
      message: 'File size is quite large.',
      suggestion: 'Consider modularizing the code into smaller files.',
    });
  }

  // Simulate async processing (and future AI integration delay)
  await new Promise(resolve => setTimeout(resolve, 200));

  return {
    file: filename,
    issues,
  };
};

export const analyzeMultipleFiles = async (files: { name: string; content: string }[]): Promise<FileAnalysis[]> => {
  return Promise.all(files.map(file => analyzeFile(file.name, file.content)));
};

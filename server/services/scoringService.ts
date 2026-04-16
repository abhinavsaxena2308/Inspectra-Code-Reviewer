import { AnalysisIssue } from './geminiService';

export const calculateScore = (issues: AnalysisIssue[]): number => {
  let score = 100;
  issues.forEach((issue: any) => {
    if (issue.type === 'bug') score -= 10;
    else if (issue.severity === 'high' || issue.severity === 'critical') score -= 15;
    else if (issue.severity === 'medium') score -= 5;
    else score -= 2;
  });
  return Math.max(0, score);
};
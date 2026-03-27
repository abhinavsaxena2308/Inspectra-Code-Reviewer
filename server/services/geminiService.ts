import { GoogleGenerativeAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AnalysisIssue {
  type: 'bug' | 'security' | 'quality' | 'suggestion' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  line?: number;
}

export const analyzeCodeWithGemini = async (
  repoName: string,
  fileName: string,
  language: string,
  codeSnippet: string
): Promise<AnalysisIssue[]> => {
  const prompt = `You are an expert software engineer and code reviewer.

Analyze the following code from a GitHub repository and provide suggestions.

Context:
- Repository Name: ${repoName}
- File Name: ${fileName}
- Language: ${language}

Code:
${codeSnippet}

Tasks:
1. Identify bugs or potential issues.
2. Suggest improvements for readability and maintainability.
3. Recommend performance optimizations (if applicable).
4. Suggest best practices based on the language.
5. If possible, provide improved version of the code.

Output Format:
You MUST return a JSON array of objects with the following schema:
[
  {
    "type": "bug" | "security" | "suggestion" | "performance",
    "severity": "low" | "medium" | "high" | "critical",
    "message": "A short summary of the issue following the 'Issues:' requirement",
    "suggestion": "A detailed fix following the 'Improvements:' and 'Optimized Code:' requirement. Include code blocks if needed."
  }
]

Do not include any other text, markdown blocks are fine if they are inside the strings. Use "bug" for general issues, "security" for vulnerabilities, "performance" for optimizations, and "suggestion" for quality/readability improvements.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up markdown block if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const jsonIssues = JSON.parse(text);
    const issues: AnalysisIssue[] = jsonIssues.map((i: any) => ({
      ...i,
      type: i.type === 'quality' ? 'suggestion' : i.type
    }));
    return issues;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback to a single detailed issue if parsing fails or error occurs
    return [{
      type: 'suggestion',
      severity: 'medium',
      message: 'AI analysis encountered an error or returned invalid format.',
      suggestion: 'Please check your API quota or ensure the code snippet is valid.'
    }];
  }
};

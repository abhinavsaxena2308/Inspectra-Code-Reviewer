import { config } from "../config";

export interface AnalysisIssue {
  type: 'bug' | 'security' | 'suggestion' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  line?: number;
}

export const analyzeCodeWithOllama = async (
  repoName: string,
  fileName: string,
  language: string,
  codeSnippet: string,
  aiSettings: any = {}
): Promise<AnalysisIssue[]> => {
  const strictnessStr = aiSettings.strictness || 'standard';
  const focusAreaStr = aiSettings.focusArea || 'general best practices';
  const customInstr = aiSettings.customInstructions ? `\nCRITICAL CUSTOM INSTRUCTIONS FROM TEAM:\n${aiSettings.customInstructions}\n` : '';

  const prompt = `You are an expert software engineer and code reviewer.

Review Strictness Level: ${strictnessStr.toUpperCase()}
Focus Area: ${focusAreaStr.toUpperCase()}
${customInstr}
Analyze the following code from a GitHub repository and provide suggestions based strictly on the configured rules above.

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
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API returned status ${response.status}`);
    }

    const data = await response.json();
    let text = data.response || "";

    if (!text) {
      throw new Error("No text returned from Ollama API");
    }

    // Clean up markdown block if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    // Sanitize literal control characters
    text = text.replace(/[\u0000-\u001F]+/g, ' ');

    const jsonIssues = JSON.parse(text);
    const issues: AnalysisIssue[] = jsonIssues.map((i: any) => ({
      ...i,
      type: i.type === 'quality' ? 'suggestion' : i.type
    }));
    return issues;
  } catch (error) {
    console.error("Ollama Analysis Error:", error);
    return [{
      type: 'suggestion',
      severity: 'medium',
      message: 'Ollama analysis encountered an error or returned invalid format.',
      suggestion: 'Please ensure Ollama is running and the selected model is pulled on your machine.'
    }];
  }
};

export const chatWithOllama = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.response || "No response generated.";
  } catch (error) {
    console.error("Ollama Chat Error:", error);
    throw new Error("Failed to communicate with local Ollama instance.");
  }
};

export interface Repository {
  id: string;
  name: string;
  url: string;
  lastAnalyzed: string;
  score: number;
  status: 'good' | 'needs-improvement' | 'critical';
  language: string;
}

export interface Issue {
  id: string;
  file: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  line: number;
  type: 'issue' | 'suggestion' | 'security' | 'performance';
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export const MOCK_REPOS: Repository[] = [
  {
    id: '1',
    name: 'facebook/react',
    url: 'https://github.com/facebook/react',
    lastAnalyzed: '2 hours ago',
    score: 92,
    status: 'good',
    language: 'TypeScript',
  },
  {
    id: '2',
    name: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
    lastAnalyzed: '1 day ago',
    score: 78,
    status: 'needs-improvement',
    language: 'JavaScript',
  },
  {
    id: '3',
    name: 'tailwindlabs/tailwindcss',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    lastAnalyzed: '3 days ago',
    score: 85,
    status: 'good',
    language: 'CSS',
  },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'i1',
    file: 'src/components/Auth.tsx',
    title: 'Potential Memory Leak',
    severity: 'high',
    description: 'The useEffect hook is missing a cleanup function for the event listener, which could lead to memory leaks when the component unmounts.',
    suggestion: 'Add a return function to the useEffect hook that removes the event listener.',
    line: 42,
    type: 'issue',
  },
  {
    id: 'i2',
    file: 'src/lib/api.ts',
    title: 'Unoptimized API Call',
    severity: 'medium',
    description: 'This API call is being made inside a loop, which can lead to performance issues and rate limiting.',
    suggestion: 'Consider using Promise.all() to batch these requests or move the logic to the backend.',
    line: 115,
    type: 'performance',
  },
  {
    id: 'i3',
    file: 'src/utils/crypto.ts',
    title: 'Weak Cryptographic Algorithm',
    severity: 'high',
    description: 'The use of MD5 for hashing passwords is insecure. MD5 is vulnerable to collision attacks.',
    suggestion: 'Use a stronger algorithm like Argon2 or bcrypt for password hashing.',
    line: 12,
    type: 'security',
  },
  {
    id: 'i4',
    file: 'src/App.tsx',
    title: 'Redundant State Update',
    severity: 'low',
    description: 'The state is being updated with the same value it already has, causing unnecessary re-renders.',
    suggestion: 'Add a check to ensure the new value is different before calling the state setter.',
    line: 28,
    type: 'suggestion',
  },
];

export const MOCK_FILE_TREE: FileNode[] = [
  {
    name: 'src',
    type: 'directory',
    children: [
      {
        name: 'components',
        type: 'directory',
        children: [
          { name: 'Auth.tsx', type: 'file' },
          { name: 'Header.tsx', type: 'file' },
          { name: 'Footer.tsx', type: 'file' },
        ],
      },
      {
        name: 'lib',
        type: 'directory',
        children: [
          { name: 'api.ts', type: 'file' },
          { name: 'utils.ts', type: 'file' },
        ],
      },
      { name: 'App.tsx', type: 'file' },
      { name: 'main.tsx', type: 'file' },
    ],
  },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
];

export const MOCK_FILE_CONTENTS: Record<string, string> = {
  'src/components/Auth.tsx': `import React, { useEffect, useState } from 'react';

export const AuthComponent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuthChange = (event) => {
      // Logic for auth change
      setUser(event.detail.user);
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    // ISSUE: Missing cleanup function here
    // return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      {user ? (
        <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
      ) : (
        <p className="text-gray-500">Please sign in to continue.</p>
      )}
    </div>
  );
};`,
  'src/lib/api.ts': `export const fetchData = async (ids: string[]) => {
  const results = [];
  
  // PERFORMANCE ISSUE: API call inside a loop
  for (const id of ids) {
    const response = await fetch(\`/api/data/\${id}\`);
    const data = await response.json();
    results.push(data);
  }
  
  return results;
};`,
  'src/utils/crypto.ts': `import crypto from 'crypto';

export const hashPassword = (password: string) => {
  // SECURITY ISSUE: Using MD5 for password hashing
  return crypto.createHash('md5').update(password).digest('hex');
};`,
  'src/App.tsx': `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const increment = () => {
    // SUGGESTION: Redundant state update if count is already updated
    setCount(count); 
    setCount(prev => prev + 1);
  };

  return (
    <div className="App">
      <button onClick={increment}>Count: {count}</button>
    </div>
  );
}

export default App;`,
};

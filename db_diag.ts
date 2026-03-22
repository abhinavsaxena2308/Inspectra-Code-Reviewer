import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@insforge/sdk';

const url = process.env.VITE_INSFORGE_URL!;
const key = process.env.VITE_INSFORGE_ANON_KEY!;

console.log('URL:', url ? 'SET' : 'MISSING');
console.log('KEY:', key ? 'SET' : 'MISSING');

if (!url || !key) {
  console.error('Credentials missing, cannot test.');
  process.exit(1);
}

const client = createClient({ baseUrl: url, anonKey: key });

(async () => {
  const testRepoUrl = 'https://github.com/test/diag-test';

  console.log('\n--- Step 1: Select repository ---');
  const { data: existingRepo, error: findError } = await client.database
    .from('repositories')
    .select('id')
    .eq('repo_url', testRepoUrl)
    .single();

  console.log('Find result:', JSON.stringify({ data: existingRepo, error: findError }));

  let repoId: string;
  if (findError?.code === 'PGRST116') {
    const { data: newRepo, error: insertErr } = await client.database
      .from('repositories')
      .insert([{ repo_url: testRepoUrl, owner: 'test', repo_name: 'diag-test' }])
      .select()
      .single();
    console.log('Insert repo result:', JSON.stringify({ data: newRepo, error: insertErr }));
    if (insertErr) process.exit(1);
    repoId = newRepo!.id;
  } else if (findError) {
    console.error('Unexpected find error:', JSON.stringify(findError));
    process.exit(1);
  } else {
    repoId = existingRepo!.id;
  }

  console.log('repoId:', repoId);

  console.log('\n--- Step 2: Insert analysis ---');
  const { data: analysis, error: analysisErr } = await client.database
    .from('analyses')
    .insert([{ repo_id: repoId, status: 'completed' }])
    .select()
    .single();
  console.log('Analysis result:', JSON.stringify({ data: analysis, error: analysisErr }));
  if (analysisErr) process.exit(1);

  console.log('\n--- Step 3: Insert issue ---');
  const { error: issueErr } = await client.database
    .from('issues')
    .insert([{
      analysis_id: analysis!.id,
      file_name: 'test.ts',
      severity: 'warning',
      message: 'Diagnostic test issue',
      suggestion: 'No fix needed'
    }]);
  console.log('Issue result:', JSON.stringify({ error: issueErr }));

  console.log('\n✅ analysisId:', analysis!.id);
})();

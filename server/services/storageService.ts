import { createClient } from '@insforge/sdk';
import { config } from '../config';

const INSFORGE_URL = process.env.VITE_INSFORGE_URL;
const INSFORGE_KEY = process.env.VITE_INSFORGE_ANON_KEY;

if (!INSFORGE_URL || !INSFORGE_KEY) {
  console.warn('[Storage] InsForge credentials missing. Data persistence will be disabled.');
}

const client = (INSFORGE_URL && INSFORGE_KEY) 
  ? createClient({ baseUrl: INSFORGE_URL, anonKey: INSFORGE_KEY })
  : null;

export const saveAnalysis = async (data: any) => {
  if (!client) {
    console.warn('[Storage] Cannot save analysis: InsForge client not initialized.');
    return null;
  }

  const { data: result, error } = await client
    .from('analyses')
    .insert([data]);

  if (error) {
    throw new Error(`Failed to save analysis to InsForge: ${error.message}`);
  }

  return result;
};

export const getAnalysis = async (id: string) => {
  if (!client) {
    console.warn('[Storage] Cannot fetch analysis: InsForge client not initialized.');
    return null;
  }

  const { data: result, error } = await client
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch analysis from InsForge: ${error.message}`);
  }

  return result;
};

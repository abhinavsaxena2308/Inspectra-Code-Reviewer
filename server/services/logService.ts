import { EventEmitter } from 'events';

class AnalysisLogEmitter extends EventEmitter {}
export const logEmitter = new AnalysisLogEmitter();

const logsCache: Record<string, string[]> = {};

export const addAnalysisLog = (analysisId: string, message: string) => {
  if (!logsCache[analysisId]) {
    logsCache[analysisId] = [];
  }
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  logsCache[analysisId].push(logMessage);
  logEmitter.emit(`log:${analysisId}`, logMessage);
  console.log(`[Analysis ${analysisId}] ${message}`);
};

export const getAnalysisLogs = (analysisId: string) => {
  return logsCache[analysisId] || [];
};

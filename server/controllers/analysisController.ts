import { Request, Response, NextFunction } from 'express';
import { analyzeFile, analyzeMultipleFiles } from '../services/analysisService';

export const analyzeCode = async (req: Request, res: Response, next: NextFunction) => {
  const { files } = req.body;

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Files array is required and must not be empty',
    });
  }

  try {
    const results = await analyzeMultipleFiles(files);
    
    res.status(200).json({
      status: 'success',
      data: {
          totalFiles: results.length,
          results,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

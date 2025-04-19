import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { NextApiHandler } from 'next';

export interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
}

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      
      req.userId = decoded.userId;
      
      return handler(req, res);
    } catch (err) {
      // Log the error for debugging (optional)
      console.error('Authentication error:', err);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };
}
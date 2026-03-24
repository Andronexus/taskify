import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
export interface AuthRequest extends Request {
    user?: User;
    userId?: number;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map
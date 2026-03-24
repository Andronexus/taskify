import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMe: (req: Request & {
    user?: User;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getTasks: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTaskById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map
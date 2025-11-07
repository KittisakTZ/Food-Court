import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

// Higher-order function ที่รับ async function และ return function ที่ express เรียกได้
const asyncHandler = (execution: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {

    execution(req, res, next).catch(next);

};
export default asyncHandler;
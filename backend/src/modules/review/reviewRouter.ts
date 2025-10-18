// @modules/review/reviewRouter.ts 

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { reviewService } from "./reviewService";
import { CreateReviewSchema, GetReviewsSchema, GetReviewsQuery } from "./reviewModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

export const reviewRouter = (() => {
    const router = express.Router();

    // GET /v1/reviews/store/:storeId - ดูรีวิวทั้งหมดของร้านค้า
    router.get(
        "/store/:storeId",
        validateRequest(GetReviewsSchema),
        async (req: Request, res: Response) => {
            const { storeId } = req.params;
            const query = req.query as unknown as GetReviewsQuery;
            const page = Number(query.page) || 1;
            const pageSize = Number(query.pageSize) || 5;

            const serviceResponse = await reviewService.getReviewsForStore(storeId, page, pageSize);
            handleServiceResponse(serviceResponse, res);
        }
    );

    router.post(
        "/store/:storeId",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(CreateReviewSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication token is missing." });
                return;
            }
            const { storeId } = req.params;
            const userForService = { id: req.token.payload.uuid };
            const serviceResponse = await reviewService.createReview(storeId, req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();
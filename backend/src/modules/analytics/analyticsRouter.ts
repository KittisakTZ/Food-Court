import express, { Request, Response } from "express";
import { handleServiceResponse } from "@common/utils/httpHandlers";
import { analyticsService } from "./analyticsService";
import authenticateToken from "@common/middleware/authenticateToken";
import { StatusCodes } from "http-status-codes";

export const analyticsRouter = (() => {
    const router = express.Router();

    router.get("/dashboard/:storeId", authenticateToken, async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }

        const { storeId } = req.params;
        const { startDate, endDate, interval } = req.query;

        const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = endDate ? new Date(endDate as string) : new Date();
        // Ensure end date includes the entire day
        end.setHours(23, 59, 59, 999);

        const serviceResponse = await analyticsService.getDashboardData(
            storeId,
            start,
            end,
            (interval as "day" | "month") || "day"
        );

        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();

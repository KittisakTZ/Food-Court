import prisma from "@src/db";
import { OrderStatus } from "@prisma/client";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export const analyticsService = {
    getDashboardData: async (storeId: string, startDate: Date, endDate: Date, interval: "day" | "month") => {
        try {
            // 1. Total Revenue & Total Orders
            const aggregations = await prisma.order.aggregate({
                _sum: {
                    totalAmount: true,
                },
                _count: {
                    id: true,
                },
                where: {
                    storeId,
                    orderDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: {
                        not: "CANCELLED" as OrderStatus,
                    },
                },
            });

            const totalRevenue = aggregations._sum.totalAmount || 0;
            const totalOrders = aggregations._count.id || 0;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            const stats = {
                totalRevenue,
                totalOrders,
                averageOrderValue,
            };

            // 2. Sales Chart
            const orders = await prisma.order.findMany({
                where: {
                    storeId,
                    orderDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: {
                        not: "CANCELLED" as OrderStatus,
                    },
                },
                select: {
                    orderDate: true,
                    totalAmount: true,
                },
                orderBy: {
                    orderDate: "asc",
                },
            });

            const chartData: Record<string, number> = {};

            orders.forEach((order: { orderDate: Date; totalAmount: number }) => {
                let key = "";
                const date = new Date(order.orderDate);
                if (interval === "day") {
                    key = date.toISOString().split("T")[0]; // YYYY-MM-DD
                } else {
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
                }

                if (!chartData[key]) {
                    chartData[key] = 0;
                }
                chartData[key] += order.totalAmount;
            });

            const salesChart = Object.entries(chartData).map(([date, amount]) => ({
                date,
                amount,
            }));

            // 3. Top Menus
            const topMenusGrouped = await prisma.orderItem.groupBy({
                by: ["menuId"],
                where: {
                    order: {
                        storeId,
                        orderDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                        status: {
                            not: "CANCELLED" as OrderStatus,
                        },
                    },
                },
                _sum: {
                    quantity: true,
                    subtotal: true,
                },
                orderBy: {
                    _sum: {
                        quantity: "desc",
                    },
                },
                take: 5,
            });

            const menuDetails = await prisma.menu.findMany({
                where: {
                    id: {
                        in: topMenusGrouped.map((item: { menuId: string }) => item.menuId),
                    },
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            });

            const topMenus = topMenusGrouped.map((item: { menuId: string; _sum: { quantity: number | null; subtotal: number | null } }) => {
                const menu = menuDetails.find((m: { id: string; name: string; image: string | null }) => m.id === item.menuId);
                return {
                    id: item.menuId,
                    name: menu?.name || "Unknown Menu",
                    image: menu?.image || "",
                    quantity: item._sum.quantity || 0,
                    sales: item._sum.subtotal || 0,
                };
            });

            return new ServiceResponse(
                ResponseStatus.Success,
                "Dashboard data fetched successfully",
                { stats, salesChart, topMenus },
                StatusCodes.OK
            );
        } catch (error) {
            console.error("Error in getDashboardData:", error);
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error fetching dashboard data",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    getCategoryAnalytics: async (storeId: string, startDate: Date, endDate: Date) => {
        try {
            const orderItems = await prisma.orderItem.findMany({
                where: {
                    order: {
                        storeId,
                        orderDate: { gte: startDate, lte: endDate },
                        status: { not: "CANCELLED" as OrderStatus },
                    },
                },
                select: {
                    quantity: true,
                    subtotal: true,
                    menu: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            category: { select: { id: true, name: true } },
                        },
                    },
                },
            });

            const categoryMap: Record<string, {
                id: string;
                name: string;
                quantity: number;
                sales: number;
                menus: Record<string, { id: string; name: string; image: string | null; quantity: number; sales: number }>;
            }> = {};

            for (const item of orderItems) {
                const cat = item.menu.category;
                const catId = cat?.id ?? "__uncategorized__";
                const catName = cat?.name ?? "Uncategorized";
                if (!categoryMap[catId]) {
                    categoryMap[catId] = { id: catId, name: catName, quantity: 0, sales: 0, menus: {} };
                }
                categoryMap[catId].quantity += item.quantity;
                categoryMap[catId].sales += item.subtotal;
                
                const menuId = item.menu.id;
                if (!categoryMap[catId].menus[menuId]) {
                    categoryMap[catId].menus[menuId] = {
                        id: menuId,
                        name: item.menu.name,
                        image: item.menu.image,
                        quantity: 0,
                        sales: 0
                    };
                }
                categoryMap[catId].menus[menuId].quantity += item.quantity;
                categoryMap[catId].menus[menuId].sales += item.subtotal;
            }

            const categories = Object.values(categoryMap)
                .map(({ menus, ...cat }) => {
                    const sortedMenus = Object.values(menus).sort((a, b) => b.sales - a.sales);
                    return {
                        ...cat,
                        topMenu: sortedMenus[0] ? { name: sortedMenus[0].name, quantity: sortedMenus[0].quantity, sales: sortedMenus[0].sales } : null,
                        menus: sortedMenus,
                    };
                })
                .sort((a, b) => b.sales - a.sales);

            return new ServiceResponse(
                ResponseStatus.Success,
                "Category analytics fetched successfully",
                { categories },
                StatusCodes.OK
            );
        } catch (error) {
            console.error("Error in getCategoryAnalytics:", error);
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error fetching category analytics",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};

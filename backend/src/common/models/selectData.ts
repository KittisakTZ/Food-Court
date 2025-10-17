import { object } from "zod";
import prisma from '@src/db';


const tableMap = {
    character: prisma.character,
    // groupItem: prisma.groupItem,
    // typeItem: prisma.typeItem,
    // unit: prisma.unit,
    ms_group_item: prisma.ms_group_item,
    ms_type_item: prisma.ms_type_item,
    ms_unit: prisma.ms_unit,
    ms_item: prisma.ms_item,
    ms_ship_type : prisma.ms_ship_type,
    ms_customer : prisma.ms_customer,
    ms_saleperson : prisma.ms_saleperson,
    ms_production_step : prisma.ms_production_step,
    ms_production_type : prisma.ms_production_type,
    ms_product_type : prisma.ms_product_type,
    ms_gender : prisma.ms_gender,
    ms_waste_product : prisma.ms_waste_product,
    ms_warehouse : prisma.ms_warehouse,
    ms_storage_location : prisma.ms_storage_location,
    ms_country : prisma.ms_country,
    ms_province : prisma.ms_province,
    ms_district : prisma.ms_district,
    ms_supplier : prisma.ms_supplier,
    // customer: prisma.customer,
    // salesperson: prisma.salesperson,
};


export const select = async (
    tableName: keyof typeof tableMap,
    searchKey: string[], // column use to search
    columns: string[], // select
    orderBy: {
        name: string,
        by: 'asc' | 'desc'
    },
    searchText: string = '',
    start: number = 1,
    stop: number = 50,
) => {

    const table = tableMap[tableName] as any;
    if (!tableName) return ('Invalid table');

    return await table.findMany({
        where: {
            ...(searchText
                && {
                OR: searchKey.map((key) => ({
                    [key]: {
                        contains: searchText,
                        mode: 'insensitive',
                    },
                })
                ),
            }
            )
        },
        select: Object.fromEntries(columns.map((col) => [col, true])),
        orderBy: {
            [orderBy.name]: orderBy.by,
        },
        skip: (start - 1) * stop,
        take: stop,
    })
}
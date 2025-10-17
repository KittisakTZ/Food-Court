import prisma from "@src/db";
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

// ----------------------------ใช้สำหรับสร้างเลขสำหรับใบเสนอราคา , ใบสั่งขาย -------------------------------
const tableMapGenNumber = {
  ms_item: prisma.ms_item,
};

export const generateNumber = async (tableName : keyof typeof tableMapGenNumber ) => {
  const table = tableMapGenNumber[tableName] as any;
    if(!tableName) return ('Invalid table');

  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');

  // ดึงรายการที่สร้างวันนี้
  const countToday = await table.count({
    where: {
      created_at: {
        gte: new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00.000Z`),
        lt: new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T23:59:59.999Z`),
      },
    },
  });

  // นับจาก 1 และต่อท้ายด้วยเลข 6 หลัก
  const sequence = String(countToday + 1).padStart(6, '0');
  return `${yyyymmdd}${sequence}`;
};


// -------------------- แปลง response type decimal ----------------------------
export function convertDecimalToNumber<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalToNumber) as T;
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value instanceof Decimal) {
        result[key] = Number(value.toString()); // หรือ value.toNumber()
      } else if (value instanceof Date) {
        result[key] = value; //  ปล่อย Date กลับไปตรง ๆ
      } else {
        result[key] = convertDecimalToNumber(value);
      }
    }
    return result as T;
  }

  return obj;
}

// ---------------------------------- Filter ------------------------------------
// --- 1. กำหนด Type สำหรับโอเปอเรเตอร์และฟิลเตอร์ ---
export type FilterOperator =
  | 'contains'
  | 'doesNotContain'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'not' // 'not' ของ Prisma คือ 'Does Not Equal' สำหรับค่าส่วนใหญ่
  | 'gt'  // Greater than
  | 'gte' // Greater than or equal
  | 'lt'  // Less than
  | 'lte' // Less than or equal
  ;

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}


// --- 2. สร้างฟังก์ชัน Helper สำหรับสร้างเงื่อนไขฟิลเตอร์ ---
// ฟังก์ชันนี้จะแปลง object ฟิลเตอร์ของเราให้เป็น object ที่ Prisma เข้าใจ
const createFilterCondition = (filter: Filter) => {
  const { field, operator, value } = filter;

  switch (operator) {
    case 'contains':
      // ใช้ mode: 'insensitive' เพื่อไม่สนใจตัวพิมพ์เล็ก/ใหญ่
      return { [field]: { contains: value, mode: 'insensitive' } };
    case 'doesNotContain':
      return { NOT: { [field]: { contains: value, mode: 'insensitive' } } };
    case 'startsWith':
      return { [field]: { startsWith: value, mode: 'insensitive' } };
    case 'endsWith':
      return { [field]: { endsWith: value, mode: 'insensitive' } };
    case 'equals':
      return { [field]: { equals: value } };
    case 'not':
      return { [field]: { not: value } };
    case 'gt':
      return { [field]: { gt: value } };
    case 'gte':
      return { [field]: { gte: value } };
    case 'lt':
      return { [field]: { lt: value } };
    case 'lte':
      return { [field]: { lte: value } };
    default:
      // หากเจอ operator ที่ไม่รู้จัก ให้ return object ว่างไปก่อน เพื่อไม่ให้ query พัง
      return {};
  }
};


// --- ส่วนของ tableMap ของคุณ (คงเดิม) ---
const tableMap = {
    character: prisma.character,
    customer: prisma.ms_customer,
    salesperson: prisma.ms_salesperson,
    ms_production_step: prisma.ms_production_step,
    ms_production_flow_template: prisma.ms_production_flow_template,
    ms_product_category: prisma.ms_product_category,
    ms_gender: prisma.ms_gender,
    ms_production_line: prisma.ms_production_line,
    ms_group_item: prisma.ms_group_item,
    ms_type_item: prisma.ms_type_item,
    ms_unit: prisma.ms_unit,
    ms_item: prisma.ms_item,
};

// ---  เพิ่มฟังก์ชัน Helper ใหม่สำหรับสร้าง Select Object ---
const createSelectObject = (columns: string[]) => {
    if (!columns || columns.length === 0) {
        return undefined; // ถ้าไม่มีคอลัมน์ที่ระบุ ให้ Prisma ใช้ default select
    }

    const selectObject: any = {};

    for (const column of columns) {
        const parts = column.split('.');
        let currentLevel = selectObject;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;

            if (isLastPart) {
                // ถ้าเป็นส่วนสุดท้ายของ path ให้ตั้งค่าเป็น true
                currentLevel[part] = true;
            } else {
                // ถ้ายังไม่ใช่ส่วนสุดท้าย ต้องแน่ใจว่า object สำหรับ relation นั้นถูกสร้างขึ้น
                if (!currentLevel[part]) {
                    currentLevel[part] = { select: {} };
                }
                // เลื่อน pointer เข้าไปใน select object ของ relation
                currentLevel = currentLevel[part].select;
            }
        }
    }
    return selectObject;
};


// --- 3. ปรับปรุงฟังก์ชัน select ---
export const filter = async (
    tableName: keyof typeof tableMap,
    filters: Filter[] = [],
    // 'columns' ตอนนี้รองรับ dot notation เช่น 'relationName.fieldName'
    columns: string[],
    orderBy: {
        name: string,
        by: 'asc' | 'desc'
    },
    start: number = 1,
    stop: number = 50,
) => {

    const table = tableMap[tableName] as any;
    if (!tableName) return ('Invalid table');

    const whereClause = filters.length > 0
        ? { AND: filters.map(createFilterCondition) }
        : {};

    // *** นี่คือส่วนที่เปลี่ยนแปลง ***
    // เราจะใช้ฟังก์ชันใหม่ในการสร้าง select object
    const selectClause = createSelectObject(columns);

    return await table.findMany({
        where: whereClause,
        // ถ้า selectClause เป็น undefined (columns ว่าง) Prisma จะ select ทุก field
        // ถ้ามีค่า ก็จะ select ตามที่เราสร้างไว้
        ...(selectClause && { select: selectClause }),
        orderBy: {
            [orderBy.name]: orderBy.by,
        },
        skip: (start - 1) * stop,
        take: stop,
    });
};
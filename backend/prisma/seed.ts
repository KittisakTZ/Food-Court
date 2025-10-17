import { PrismaClient, roles } from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from "bcrypt";
import { rolesData } from "../src/common/models/roleData";

async function main() {
  let roldAdmin: roles | null = null;

  for (const role of rolesData) {
      const result = await prisma.roles.upsert({
          where: { role_name: role },
          update: {}, // No update needed for now
          create: {
              role_name: role,
          },
      });

      // Save the result for the Admin role
      if (role === "Admin") {
          roldAdmin = result;
      }
  }
  if (!roldAdmin) {
    throw new Error("Admin role was not found or created.");
  }

  // create Company
  const company = await prisma.company.upsert({
    where: { name_th : 'บริษัท บลูพีค อินโนเวชั่น จำกัด'},
    update: {},
    create: {
      name_th: 'บริษัท บลูพีค อินโนเวชั่น จำกัด',
      name_en: 'BluePeak Innovations Co., Ltd.',
    }
  })
  
  // Create User Admin
  const password = "123456";
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);  
  const hashPassword = await bcrypt.hash(password, salt);
  
  const employeeAdmin = await prisma.employees.upsert({
    where: { username: 'admin@gmail.com' },
    update: {},
    create: {
      employee_code: 'K1000',
        username: 'admin@gmail.com',
        password: hashPassword, 
        email: 'admin@gmail.com',
        role_id: roldAdmin.role_id,
        first_name: 'admin',
        is_active: true
    },
  })

  const devPor = await prisma.employees.upsert({
    where: { username: 'myzero0139@gmail.com' },
    update: {},
    create: {
      employee_code: 'K1001',
        username: 'myzero0139@gmail.com',
        password: hashPassword, 
        email: 'myzero0139@gmail.com',
        role_id: roldAdmin.role_id,
        first_name: 'zero',
        is_active: true
    },
  })

  const devAnmum = await prisma.employees.upsert({
    where: { username: 'Anmum@gmail.com' },
    update: {},
    create: {
      employee_code: 'K9999',
        username: 'Anmum@gmail.com',
        password: hashPassword, 
        email: 'Anmum@gmail.com',
        role_id: roldAdmin.role_id,
        first_name: 'Anmum',
        is_active: true
    },
  })

}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import errorHandler from "@common/middleware/errorHandler";
import cookieParser from "cookie-parser";
import path from 'path';

import { env } from "@common/utils/envConfig";
import { pino } from "pino";
import { authRouter } from "@modules/auth/authRouter";
import { employeeRouter } from "@modules/employee/employeeRouter";
import { characterRouter } from "@modules/character/characterRouter";
import { groupItemRouter } from "@modules/ms_group_item/groupItemRouter";
import { typeItemRouter } from "@modules/ms_type_item/typeItemRouter";
import { unitRouter } from "@modules/ms_unit/unitRouter";
import { itemRouter } from "@modules/ms_item/itemRouter";

// test case
import { roleRouter } from "@modules/role/roleRouter";
import { customerRouter } from "@modules/ms_customer/customerRouter";
import { productTypeRouter } from "@modules/ms_product_type/productTypeRouter";
import { productionTypeRouter } from "@modules/ms_production_type/productionTypeRouter";
import { wasteProductRouter } from "@modules/ms_waste_product/wasteProductRouter";
import { warehouseRouter } from "@modules/ms_warehouse/warehouseRouter";
import { storageLocationRouter } from "@modules/ms_storage_location/storageLocationRouter";
import { countryRouter } from "@modules/ms_country/countryRouter";
import { provinceRouter } from "@modules/ms_province/provinceRouter";
import { districtRouter } from "@modules/ms_district/districtRouter";
import { salepersonRouter } from "@modules/ms_salesperson/salepersonRouter";
import { productionStepRouter } from "@modules/ms_production_step/productionStepRouter";
import { genderRouter } from "@modules/ms_gender/genderRouter";

const logger = pino({ name: "server start" });
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// Routes
app.use("/v1/auth", authRouter);
app.use("/v1/character", characterRouter);
app.use("/v1/employee", employeeRouter);
app.use("/v1/role", roleRouter);
app.use("/v1/group-item", groupItemRouter);
app.use("/v1/type-item", typeItemRouter);
app.use("/v1/saleperson",salepersonRouter);
app.use("/v1/customer", customerRouter);
app.use("/v1/unit", unitRouter);
app.use("/v1/item", itemRouter);
app.use("/v1/product-type", productTypeRouter);
app.use("/v1/production-type", productionTypeRouter);
app.use("/v1/production-step", productionStepRouter);
app.use("/v1/waste-product", wasteProductRouter);
app.use("/v1/warehouse", warehouseRouter);
app.use("/v1/storage-location", storageLocationRouter);
app.use("/v1/country", countryRouter);
app.use("/v1/province", provinceRouter);
app.use("/v1/district", districtRouter);
app.use("/v1/gender", genderRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(errorHandler());
export { app, logger };
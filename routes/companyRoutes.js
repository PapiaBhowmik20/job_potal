import express from "express";
import { updateCompany } from "../controllers/companyController.js";

const router = express.Router();

router.post("/update-company", updateCompany);

export default router;
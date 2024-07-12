import { Router } from "express";
import {
  listUsers,
  listDevices,
  deleteDevice,
} from "../controllers/userController";

const router = Router();

router.get("/list", listUsers);
router.post("/list-devices", listDevices);
router.post("/delete-device", deleteDevice);

export default router;

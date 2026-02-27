import { Router } from "express";
import {
  getMessages,
  getUserOverview,
  getUsers,
} from "../controllers/api.controller";

const router = Router();

router.get("/users", getUsers);
router.get("/users/:id", getUserOverview);
router.get("/messages", getMessages);

export default router;

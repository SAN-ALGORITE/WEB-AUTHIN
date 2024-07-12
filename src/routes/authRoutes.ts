import { Router } from "express";
import {
  generateAuthRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  generateAuthenticationOptionsInit,
} from "../controllers/authController";

const router = Router();

router.post("/generate-registration-options", generateAuthRegistrationOptions);
router.post("/verify-registration", verifyRegistration);
router.post("/generate-authentication-options", generateAuthenticationOptions);
router.post(
  "/generate-authentication-options-init",
  generateAuthenticationOptionsInit
);
router.post("/verify-authentication", verifyAuthentication);

export default router;

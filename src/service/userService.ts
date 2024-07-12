import { Device } from "../entities/devices.entity";
import { User } from "../entities/user.entity";
import { BaseCrudService } from "./base-crud.service";
import jwt from "jsonwebtoken";

export const getUserData = async (loggedInUserId: string) => {
  const user: User = await BaseCrudService.getById(loggedInUserId, User);
  if (!user) {
    return null;
  }
  const devices: Device[] = await BaseCrudService.getByAttribute(
    "userId",
    loggedInUserId,
    Device
  );
  return { ...user, devices };
};

export const createUserJWT = async (userData: User) => {
  const {
    sub,
    email_verified,
    iss,
    "cognito:username": cognitoUsername,
    origin_jti,
    "custom:roleName": roleName,
    aud,
    event_id,
    token_use,
    auth_time,
    name,
    "custom:vendorType": vendorType,
    exp,
    iat,
    jti,
    email,
  } = JSON.parse(userData.claims);

  const newExp = Date.now() + 3600 * 1000; // Set new expiry date to 1 hour from now
  const newIss = "https://new-issuer.com";

  const newToken = {
    sub,
    email_verified,
    iss: newIss,
    "cognito:username": cognitoUsername,
    origin_jti,
    "custom:roleName": roleName,
    aud,
    event_id,
    token_use,
    auth_time,
    name,
    "custom:vendorType": vendorType,
    exp: newExp,
    iat,
    jti,
    email,
  };

  const jwtToken = jwt.sign(newToken, process.env.JWT_SECRET as string);

  return jwtToken;
};

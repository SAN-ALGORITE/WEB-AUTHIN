import dotenv from "dotenv-flow";
import { LoggedInUser } from "../types/global.types";

dotenv.config();

const loggedInUserId = "internalUserId";

/**
 * RP ID represents the "scope" of websites on which a authenticator should be usable. The Origin
 * represents the expected URL from which registration or authentication occurs.
 */
const rpId = process.env.RP_ID || "localhost";

interface IConfig {
  ENABLE_CONFORMANCE: boolean;
  ENABLE_HTTPS: boolean;
  SESSION_SECRET: string;
  RP_ID: string;
  inMemoryUserDeviceDB: { [loggedInUserId: string]: LoggedInUser };
  loggedInUserId: string;
  expectedOrigin: string[];
}

export const config: IConfig = {
  ENABLE_CONFORMANCE: process.env.ENABLE_CONFORMANCE === "true",
  ENABLE_HTTPS: process.env.ENABLE_HTTPS === "true",
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  RP_ID: rpId,
  inMemoryUserDeviceDB: {
    [loggedInUserId]: {
      id: loggedInUserId,
      username: `user@${rpId}`,
      devices: [],
    },
  },
  /**
   * 2FA and Passwordless WebAuthn flows expect you to be able to uniquely identify the user that
   * performs registration or authentication. The user ID you specify here should be your internal,
   * _unique_ ID for that user (uuid, etc...). Avoid using identifying information here, like email
   * addresses, as it may be stored within the authenticator.
   *
   * Here, the example server assumes the following user has completed login:
   */
  loggedInUserId,
  // This value is set at the bottom of page as part of server initialization (the empty string is
  // to appease TypeScript until we determine the expected origin based on whether or not HTTPS
  // support is enabled)
  expectedOrigin: [
    `http://localhost:8000`,
    `http://localhost:3000`,
    "https://www.crewtransit.com",
    process.env.BASE_URL as string,
  ],
};

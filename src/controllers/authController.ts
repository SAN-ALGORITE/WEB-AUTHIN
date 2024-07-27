import { Request, Response } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions as generateAuthOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { config } from "../config";
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticatorDevice,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";
import { BaseCrudService } from "../service/base-crud.service";
import { Device } from "../entities/devices.entity";
import { createUserJWT, getUserData } from "../service/userService";
import { User } from "../entities/user.entity";

const {
  inMemoryUserDeviceDB,
  loggedInUserId,
  RP_ID: rpID,
  expectedOrigin,
} = config;

export const generateAuthRegistrationOptions = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, claims } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    let user = await getUserData(userId);
    if (!user) {
      user = await BaseCrudService.create(
        { id: userId, claims: JSON.stringify(claims) },
        User
      );

      if (!user) {
        return res.status(500).json({ error: "Failed to create user" });
      }
      user = { ...user, devices: [] };
    }

    const { id } = user;

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: "test-customer",
      rpID,
      userName: id,
      userDisplayName: id,
      timeout: 60000,
      attestationType: "none",
      /**
       * Passing in a user's list of already-registered authenticator IDs here prevents users from
       * registering the same device multiple times. The authenticator will simply throw an error in
       * the browser if it's asked to perform registration when one of these ID's already resides
       * on it.
       */
      excludeCredentials: user.devices?.map((dev) => ({
        id: dev.credentialID,
        type: "public-key",
        transports: dev.transports,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        requireResidentKey: false,
        /**
         * Wondering why user verification isn't required? See here:
         *
         * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
         */
        userVerification: "preferred",
      },
      /**
       * Support the two most common algorithms: ES256, and RS256
       */
      supportedAlgorithmIDs: [-7, -257],
    };

    const options = await generateRegistrationOptions(opts);
    /**
     * The server needs to temporarily remember this value for verification, so don't lose it until
     * after you verify an authenticator response.
     */
    req.session.currentChallenge = options.challenge;
    req.session.userId = id;
    res.send(options);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

export const verifyRegistration = async (req: Request, res: Response) => {
  const { body } = req;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(400).send({
      error: "User not found",
    });
  }
  const user = await getUserData(userId);
  if (!user) {
    return res.status(400).send({
      error: "User not found",
    });
  }
  const expectedChallenge = req.session.currentChallenge;

  const opts: VerifyRegistrationResponseOpts = {
    response: body as RegistrationResponseJSON,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: false,
  };

  try {
    const verification = await verifyRegistrationResponse(opts);
    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const {
        credentialPublicKey,
        credentialID,
        counter,
        aaguid,
        credentialDeviceType,
        credentialType,
      } = registrationInfo;

      const existingDevice = user?.devices?.find(
        (device) => device.credentialID === credentialID
      );

      if (!existingDevice) {
        /**
         * Add the returned device to the user's list of devices
         */
        const newDevice: Omit<Device, "id"> = {
          credentialPublicKey,
          credentialID,
          counter,
          aaguid,
          credentialDeviceType,
          credentialType,
          userId: userId,
          transports: body.response.transports,
        };
        await BaseCrudService.create(newDevice, Device);
      }
    }

    req.session.currentChallenge = undefined;
    res.send({ verified, token: await createUserJWT(user) });
  } catch (error: any) {
    res.status(400).send({ error: error?.message });
  }
};

export const generateAuthenticationOptions = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({
      error: "userId is required",
    });
  }

  const user = await getUserData(userId);
  if (!user) {
    return res.status(400).send({
      error: "User not found",
    });
  }

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user?.devices?.map((dev) => ({
      id: dev.credentialID,
      type: "public-key",
      transports: dev.transports,
    })),
    /**
     * Wondering why user verification isn't required? See here:
     *
     * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
     */
    userVerification: "preferred",
    rpID,
  };

  const options = await generateAuthOptions(opts);
  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify an authenticator response.
   */
  req.session.currentChallenge = options.challenge;
  res.send(options);
};

export const generateAuthenticationOptionsInit = async (
  req: Request,
  res: Response
) => {
  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    /**
     * Wondering why user verification isn't required? See here:
     *
     * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
     */
    userVerification: "preferred",
    rpID,
  };

  const options = await generateAuthOptions(opts);
  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify an authenticator response.
   */
  req.session.currentChallenge = options.challenge;
  res.send(options);
};

export const verifyAuthentication = async (req: Request, res: Response) => {
  const body: AuthenticationResponseJSON = req.body;
  const loggedInUserId = req.body.userId;
  delete req.body.userId;
  if (!loggedInUserId) {
    return res.status(400).send({
      error: "userId is required",
    });
  }
  const user = await getUserData(loggedInUserId);
  if (!user) {
    return res.status(400).send({
      error: "User not found",
    });
  }
  const expectedChallenge = req.session.currentChallenge;

  let dbAuthenticator;
  // "Query the DB" here for an authenticator matching `credentialID`
  for (const dev of user?.devices) {
    if (dev.credentialID === body.id) {
      dbAuthenticator = dev;
      break;
    }
  }

  if (!dbAuthenticator) {
    return res.status(400).send({
      error: "Authenticator is not registered with this site",
    });
  }

  const opts: VerifyAuthenticationResponseOpts = {
    response: body,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    authenticator: {
      credentialPublicKey: new Uint8Array(
        Object.values(dbAuthenticator.credentialPublicKey)
      ),
      credentialID: dbAuthenticator.credentialID,
      counter: dbAuthenticator.counter,
    },
    requireUserVerification: false,
  };

  try {
    const verification = await verifyAuthenticationResponse(opts);
    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update the authenticator's counter in the DB to the newest count in the authentication
      dbAuthenticator.counter = authenticationInfo.newCounter;
    }

    req.session.currentChallenge = undefined;
    res.send({ verified, token: await createUserJWT(user) });
  } catch (error: any) {
    res.status(400).send({ error: error?.message });
  }
};

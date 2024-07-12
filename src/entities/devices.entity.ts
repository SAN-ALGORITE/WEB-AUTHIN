import { AuthenticatorTransportFuture } from "@simplewebauthn/server/script/deps";
import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
} from "@typedorm/common";

@Entity({
  name: "device",
  primaryKey: {
    partitionKey: "DEVICE",
    sortKey: "DEVICE#{{id}}",
  },
})
export class Device {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  id: string;

  @Attribute()
  userId: string;

  @Attribute()
  aaguid: string;

  @Attribute()
  credentialDeviceType: string;

  @Attribute()
  credentialType: string;

  @Attribute()
  credentialID: string;

  @Attribute()
  credentialPublicKey: Uint8Array;

  @Attribute()
  counter: number;

  @Attribute()
  transports?: AuthenticatorTransportFuture[];
}

import { Attribute, Entity } from "@typedorm/common";

@Entity({
  name: "user",
  primaryKey: {
    partitionKey: "USER",
    sortKey: "USER#{{id}}",
  },
})
export class User {
  @Attribute({ unique: true })
  id: string;

  @Attribute()
  username: string;

  @Attribute({ default: "" })
  email: string;

  @Attribute()
  claims: string;
}

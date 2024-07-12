import { Table } from "@typedorm/common";

export const myGlobalTable = new Table({
  name: "web-authn",
  partitionKey: "ENTITY",
  sortKey: "SORT",
});

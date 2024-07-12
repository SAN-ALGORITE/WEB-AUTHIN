import { Connection, createConnection } from "@typedorm/core";
import { myGlobalTable } from "./dynamo-table";
import { DocumentClientV3 } from "@typedorm/document-client";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { User } from "../entities/user.entity";
import { Device } from "../entities/devices.entity";

export interface DatabaseConfiguration {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  ssl?: boolean;
}

export class DatabaseProvider {
  private static connection: Connection;
  private static configuration: DatabaseConfiguration;

  /**
   * Configure the database provider.
   *
   * @param {DatabaseConfiguration} databaseConfiguration - The configuration for the database.
   * @return {void} This function does not return anything.
   */
  public static configure(databaseConfiguration: DatabaseConfiguration): void {
    DatabaseProvider.configuration = databaseConfiguration;
  }

  /**
   * Retrieves the connection to the database.
   *
   * @return {Connection} The connection to the database.
   */
  public static getConnection(): Connection {
    if (DatabaseProvider.connection) {
      return DatabaseProvider.connection;
    }

    if (!DatabaseProvider.configuration) {
      throw new Error("DatabaseProvider is not configured yet.");
    }

    const { region, accessKeyId, secretAccessKey } =
      DatabaseProvider.configuration;

    DatabaseProvider.connection = createConnection({
      table: myGlobalTable,
      entities: [User, Device],
      documentClient: new DocumentClientV3(
        new DynamoDBClient({
          region: region,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        })
      ),
    });

    return DatabaseProvider.connection;
  }
}

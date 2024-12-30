import database from "infra/database";
import { InternalServerError } from "infra/errors";

export default async function handle(request, response) {
  try {
    const updateAt = new Date().toISOString();

    const databaseVersionResult = await database.query("SHOW server_version;");
    const databaseVersionValue = databaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnections =
      databaseMaxConnectionsResult.rows[0].max_connections;

    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [process.env.POSTGRES_DB],
    });
    const databaseOpenedConnections =
      databaseOpenedConnectionsResult.rows[0].count;

    return response.status(200).json({
      updated_at: updateAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnections),
          opened_connections: databaseOpenedConnections,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });
    console.error(publicErrorObject);

    return response
      .status(publicErrorObject.statusCode)
      .json(publicErrorObject);
  }
}

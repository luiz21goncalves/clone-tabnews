import database from "infra/database.js";

export default async function handle(request, response) {
  const result = await database.query("SELECT 1 + 1 as sum;");

  console.log(result.rows);
  return response.status(200).json({ key: "são acima da média" });
}

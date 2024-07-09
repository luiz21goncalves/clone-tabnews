const { exec } = require("node:child_process");

function checkPostgres() {
  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n\r🟢 Postgres está pronto e aceitando conexões!\n\r");
  }

  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);
}

process.stdout.write("\n\r\n\r🔴 Aguardando Postgres aceitar conexões");

checkPostgres();

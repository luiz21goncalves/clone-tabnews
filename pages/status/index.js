import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return "Carregando...";
  }

  let formattedDate = new Date(data.updated_at).toLocaleString("pt-BR");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2>Última atualização: {formattedDate}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <strong>Banco de Dados</strong>
        <span>Status: healthy</span>
        <span>
          Conexões disponíveis: {data.dependencies.database.max_connections}
        </span>
        <span>
          Conexões abertas: {data.dependencies.database.opened_connections}
        </span>
        <span>Versão do PostgreSQL: {data.dependencies.database.version}</span>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

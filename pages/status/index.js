import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

function DatabaseStatus() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!data) {
    return (
      <>
        <h2>Database</h2>
        <p>Não foi possível obter dados.</p>
      </>
    );
  }

  return (
    <>
      <h2>Database</h2>
      <div>
        <p>Versão: {data.dependencies.database.version}</p>
        <p>Conexões abertas: {data.dependencies.database.opened_connections}</p>
        <p>Conexões máximas: {data.dependencies.database.max_connections}</p>
      </div>
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  const formattedDate = new Date(data.updated_at).toLocaleString("pt-BR");

  return <p>Última atualização: {formattedDate}</p>;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

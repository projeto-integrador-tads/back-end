import app from "./config/app";

app
  .listen({ port: 3000 })
  .then(() => {
    console.log("Servidor rodando em http://localhost:3000");
  })
  .catch((err) => {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  });

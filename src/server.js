const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const talhaoRoutes = require("./routes/talhaoRoutes");
const aprovacaoRoutes = require("./routes/aprovacaoRoutes");
const historicoRoutes = require("./routes/historicoRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");
const irrigacaoRoutes = require("./routes/irrigacaoRoutes");
const alertaRoutes = require("./routes/alertaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const mapaRoutes = require("./routes/mapaRoutes");

const {
  iniciarMonitoramentoAutomatico
} = require("./jobs/monitoramentoJob");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.API_URL || `http://localhost:${PORT}`;

app.get("/", (req, res) => {
  res.json({
    message: "API AgroSync rodando com sucesso",
    swagger: `${BASE_URL}/api-docs`
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/talhoes", talhaoRoutes);
app.use("/aprovacoes", aprovacaoRoutes);
app.use("/historicos", historicoRoutes);
app.use("/estoque", estoqueRoutes);
app.use("/irrigacoes", irrigacaoRoutes);
app.use("/alertas", alertaRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/mapa", mapaRoutes);

iniciarMonitoramentoAutomatico();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Swagger disponível em ${BASE_URL}/api-docs`);
});
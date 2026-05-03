const express = require("express");
const irrigacaoController = require("../controllers/irrigacaoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", irrigacaoController.listarIrrigacoes);
router.get("/:id", irrigacaoController.buscarIrrigacaoPorId);
router.post("/", irrigacaoController.criarIrrigacao);
router.patch("/:id", irrigacaoController.atualizarIrrigacao);
router.patch("/:id/pausar", irrigacaoController.pausarIrrigacao);
router.patch("/:id/ativar", irrigacaoController.ativarIrrigacao);
router.patch("/:id/concluir", irrigacaoController.concluirIrrigacao);
router.delete("/:id", irrigacaoController.removerIrrigacao);

module.exports = router;
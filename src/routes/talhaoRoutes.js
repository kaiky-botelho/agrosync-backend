const express = require("express");
const talhaoController = require("../controllers/talhaoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", talhaoController.listarTalhoes);
router.get("/:id", talhaoController.buscarTalhaoPorId);
router.post("/", talhaoController.criarTalhao);
router.patch("/:id", talhaoController.atualizarTalhao);
router.post("/:id/solicitar-desativacao", talhaoController.solicitarDesativacaoTalhao);

module.exports = router;
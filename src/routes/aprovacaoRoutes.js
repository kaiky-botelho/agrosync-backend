const express = require("express");
const aprovacaoController = require("../controllers/aprovacaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/desativacoes", aprovacaoController.listarSolicitacoesDesativacao);
router.get("/desativacoes/:id", aprovacaoController.buscarSolicitacaoDesativacaoPorId);
router.patch("/desativacoes/:id/aprovar", aprovacaoController.aprovarSolicitacaoDesativacao);
router.patch("/desativacoes/:id/recusar", aprovacaoController.recusarSolicitacaoDesativacao);

module.exports = router;
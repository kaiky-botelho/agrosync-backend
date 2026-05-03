const express = require("express");
const historicoController = require("../controllers/historicoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", historicoController.listarHistoricos);
router.get("/usuario/:usuarioId", historicoController.listarHistoricoPorUsuario);
router.get("/entidade/:entidade/:entidadeId", historicoController.listarHistoricoPorEntidade);
router.get("/:id", historicoController.buscarHistoricoPorId);

module.exports = router;
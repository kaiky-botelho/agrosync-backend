const express = require("express");
const alertaController = require("../controllers/alertaController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", alertaController.listarAlertas);
router.get("/:id", alertaController.buscarAlertaPorId);
router.post("/", alertaController.criarAlerta);
router.patch("/:id", alertaController.atualizarAlerta);
router.patch("/:id/solucionar", alertaController.solucionarAlerta);
router.delete("/:id", alertaController.removerAlerta);

module.exports = router;
const express = require("express");
const estoqueController = require("../controllers/estoqueController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", estoqueController.listarEstoque);
router.get("/:id", estoqueController.buscarItemEstoquePorId);
router.post("/", estoqueController.criarItemEstoque);
router.patch("/:id", estoqueController.atualizarItemEstoque);
router.post("/:id/movimentar", estoqueController.movimentarEstoque);
router.delete("/:id", estoqueController.removerItemEstoque);

module.exports = router;
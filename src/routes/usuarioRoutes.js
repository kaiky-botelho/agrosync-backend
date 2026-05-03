const express = require("express");
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", usuarioController.listarUsuarios);
router.get("/:id", usuarioController.buscarUsuarioPorId);
router.post("/", usuarioController.criarUsuario);
router.patch("/:id", usuarioController.atualizarUsuario);
router.patch("/:id/status", usuarioController.alterarStatusUsuario);
router.delete("/:id", usuarioController.removerUsuario);

module.exports = router;
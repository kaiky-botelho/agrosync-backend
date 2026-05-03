const express = require("express");
const mapaController = require("../controllers/mapaController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/talhoes", mapaController.listarTalhoesMapa);

module.exports = router;
const prisma = require("../database/prismaClient");
const {
  atualizarMonitoramentoTalhoesAutomaticamente
} = require("../services/monitoramentoService");

async function listarTalhoesMapa(req, res) {
  try {
    await atualizarMonitoramentoTalhoesAutomaticamente();

    const { status, cultura } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (cultura) {
      where.cultura = cultura;
    }

    const talhoes = await prisma.talhao.findMany({
      where,
      orderBy: {
        nome: "asc"
      },
      select: {
        id: true,
        nome: true,
        cultura: true,
        areaHectares: true,
        tipoSolo: true,
        status: true,
        umidadeSolo: true,
        temperatura: true,
        latitude: true,
        longitude: true,
        updatedAt: true
      }
    });

    return res.json(talhoes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar talhões no mapa",
      error: error.message
    });
  }
}

module.exports = {
  listarTalhoesMapa
};
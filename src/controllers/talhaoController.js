const prisma = require("../database/prismaClient");
const { registrarHistorico } = require("../services/historicoService");
const { verificarAlertaTalhao } = require("../services/alertaService");
const {
  gerarLeituraInicialTalhao,
  atualizarMonitoramentoTalhoesAutomaticamente
} = require("../services/monitoramentoService");

async function listarTalhoes(req, res) {
  try {
    await atualizarMonitoramentoTalhoesAutomaticamente();

    const talhoes = await prisma.talhao.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(talhoes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar talhões",
      error: error.message
    });
  }
}

async function buscarTalhaoPorId(req, res) {
  try {
    await atualizarMonitoramentoTalhoesAutomaticamente();

    const { id } = req.params;

    const talhao = await prisma.talhao.findUnique({
      where: { id },
      include: {
        irrigacoes: true,
        alertas: true,
        solicitacoesDesativacao: true
      }
    });

    if (!talhao) {
      return res.status(404).json({
        message: "Talhão não encontrado"
      });
    }

    return res.json(talhao);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar talhão",
      error: error.message
    });
  }
}

async function criarTalhao(req, res) {
  try {
    const {
      nome,
      cultura,
      areaHectares,
      tipoSolo,
      latitude,
      longitude,
      umidadeSolo,
      temperatura
    } = req.body;

    if (!nome || !cultura || !areaHectares) {
      return res.status(400).json({
        message: "Nome, cultura e área são obrigatórios"
      });
    }

    const talhaoExistente = await prisma.talhao.findUnique({
      where: { nome }
    });

    if (talhaoExistente) {
      return res.status(400).json({
        message: "Já existe um talhão com este nome"
      });
    }

    const leituraInicial = gerarLeituraInicialTalhao({
      umidadeSolo,
      temperatura
    });

    const talhao = await prisma.talhao.create({
      data: {
        nome,
        cultura,
        areaHectares: Number(areaHectares),
        tipoSolo: tipoSolo || null,
        latitude: latitude !== undefined && latitude !== "" ? Number(latitude) : null,
        longitude:
          longitude !== undefined && longitude !== "" ? Number(longitude) : null,
        umidadeSolo: leituraInicial.umidadeSolo,
        temperatura: leituraInicial.temperatura,
        status: leituraInicial.status
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "CRIAR_TALHAO",
      entidade: "Talhao",
      entidadeId: talhao.id,
      descricao: `Talhão ${talhao.nome} criado.`,
      dadosNovos: talhao
    });

    await verificarAlertaTalhao(talhao);

    return res.status(201).json({
      message: "Talhão criado com sucesso",
      talhao
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar talhão",
      error: error.message
    });
  }
}

async function atualizarTalhao(req, res) {
  try {
    const { id } = req.params;

    const talhaoAnterior = await prisma.talhao.findUnique({
      where: { id }
    });

    if (!talhaoAnterior) {
      return res.status(404).json({
        message: "Talhão não encontrado"
      });
    }

    const {
      nome,
      cultura,
      areaHectares,
      tipoSolo,
      latitude,
      longitude
    } = req.body;

    const talhao = await prisma.talhao.update({
      where: { id },
      data: {
        nome,
        cultura,
        areaHectares:
          areaHectares !== undefined ? Number(areaHectares) : undefined,
        tipoSolo,
        latitude:
          latitude !== undefined && latitude !== "" ? Number(latitude) : undefined,
        longitude:
          longitude !== undefined && longitude !== ""
            ? Number(longitude)
            : undefined
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "EDITAR_TALHAO",
      entidade: "Talhao",
      entidadeId: talhao.id,
      descricao: `Talhão ${talhao.nome} atualizado.`,
      dadosAnteriores: talhaoAnterior,
      dadosNovos: talhao
    });

    await atualizarMonitoramentoTalhoesAutomaticamente();

    const talhaoAtualizado = await prisma.talhao.findUnique({
      where: { id }
    });

    return res.json({
      message: "Talhão atualizado com sucesso",
      talhao: talhaoAtualizado
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar talhão",
      error: error.message
    });
  }
}

async function solicitarDesativacaoTalhao(req, res) {
  try {
    const { id } = req.params;
    const { justificativa } = req.body;

    if (!justificativa) {
      return res.status(400).json({
        message: "A justificativa é obrigatória"
      });
    }

    const talhao = await prisma.talhao.findUnique({
      where: { id }
    });

    if (!talhao) {
      return res.status(404).json({
        message: "Talhão não encontrado"
      });
    }

    if (talhao.status === "INATIVO") {
      return res.status(400).json({
        message: "Este talhão já está inativo"
      });
    }

    const solicitacaoPendente = await prisma.solicitacaoDesativacao.findFirst({
      where: {
        talhaoId: id,
        status: "PENDENTE"
      }
    });

    if (solicitacaoPendente) {
      return res.status(400).json({
        message: "Já existe uma solicitação pendente para este talhão"
      });
    }

    const solicitacao = await prisma.solicitacaoDesativacao.create({
      data: {
        talhaoId: id,
        solicitadoPorId: req.usuario.id,
        justificativa
      },
      include: {
        talhao: true,
        solicitadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true
          }
        }
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "SOLICITAR_DESATIVACAO_TALHAO",
      entidade: "SolicitacaoDesativacao",
      entidadeId: solicitacao.id,
      descricao: `Solicitação de desativação criada para o talhão ${talhao.nome}.`,
      dadosNovos: solicitacao
    });

    return res.status(201).json({
      message: "Solicitação de desativação criada com sucesso",
      solicitacao
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao solicitar desativação do talhão",
      error: error.message
    });
  }
}

module.exports = {
  listarTalhoes,
  buscarTalhaoPorId,
  criarTalhao,
  atualizarTalhao,
  solicitarDesativacaoTalhao
};
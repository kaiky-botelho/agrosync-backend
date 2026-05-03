const prisma = require("../database/prismaClient");
const { registrarHistorico } = require("../services/historicoService");
const { verificarAlertaIrrigacao } = require("../services/alertaService");
const {
  calcularStatusAutomatico,
  atualizarStatusIrrigacoesAutomaticamente
} = require("../services/irrigacaoStatusService");

async function listarIrrigacoes(req, res) {
  try {
    await atualizarStatusIrrigacoesAutomaticamente();

    const irrigacoes = await prisma.irrigacao.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        talhao: true
      }
    });

    return res.json(irrigacoes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar irrigações",
      error: error.message
    });
  }
}

async function buscarIrrigacaoPorId(req, res) {
  try {
    await atualizarStatusIrrigacoesAutomaticamente();

    const { id } = req.params;

    const irrigacao = await prisma.irrigacao.findUnique({
      where: { id },
      include: {
        talhao: true
      }
    });

    if (!irrigacao) {
      return res.status(404).json({
        message: "Irrigação não encontrada"
      });
    }

    return res.json(irrigacao);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar irrigação",
      error: error.message
    });
  }
}

async function criarIrrigacao(req, res) {
  try {
    const {
      talhaoId,
      tipoIrrigacao,
      horaInicio,
      duracaoMinutos,
      diasSemana
    } = req.body;

    if (
      !talhaoId ||
      !tipoIrrigacao ||
      !horaInicio ||
      !duracaoMinutos ||
      !diasSemana ||
      diasSemana.length === 0
    ) {
      return res.status(400).json({
        message:
          "Talhão, tipo de irrigação, hora de início, duração e dias da semana são obrigatórios"
      });
    }

    const talhao = await prisma.talhao.findUnique({
      where: { id: talhaoId }
    });

    if (!talhao) {
      return res.status(404).json({
        message: "Talhão não encontrado"
      });
    }

    if (talhao.status === "INATIVO") {
      return res.status(400).json({
        message: "Não é possível criar irrigação para um talhão inativo"
      });
    }

    const statusAutomatico = calcularStatusAutomatico({
      horaInicio,
      duracaoMinutos,
      diasSemana,
      status: "AGENDADO"
    });

    const irrigacao = await prisma.irrigacao.create({
      data: {
        talhaoId,
        tipoIrrigacao,
        horaInicio,
        duracaoMinutos: Number(duracaoMinutos),
        diasSemana,
        status: statusAutomatico
      },
      include: {
        talhao: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "CRIAR_PROGRAMACAO_IRRIGACAO",
      entidade: "Irrigacao",
      entidadeId: irrigacao.id,
      descricao: `Programação de irrigação criada para o ${talhao.nome}.`,
      dadosNovos: irrigacao
    });

    await verificarAlertaIrrigacao(irrigacao);

    return res.status(201).json({
      message: "Irrigação criada com sucesso",
      irrigacao
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar irrigação",
      error: error.message
    });
  }
}

async function atualizarIrrigacao(req, res) {
  try {
    const { id } = req.params;

    const irrigacaoAnterior = await prisma.irrigacao.findUnique({
      where: { id },
      include: {
        talhao: true
      }
    });

    if (!irrigacaoAnterior) {
      return res.status(404).json({
        message: "Irrigação não encontrada"
      });
    }

    const {
      talhaoId,
      tipoIrrigacao,
      horaInicio,
      duracaoMinutos,
      diasSemana
    } = req.body;

    if (talhaoId) {
      const talhao = await prisma.talhao.findUnique({
        where: { id: talhaoId }
      });

      if (!talhao) {
        return res.status(404).json({
          message: "Talhão não encontrado"
        });
      }

      if (talhao.status === "INATIVO") {
        return res.status(400).json({
          message: "Não é possível vincular irrigação a um talhão inativo"
        });
      }
    }

    const dadosParaCalcular = {
      horaInicio: horaInicio || irrigacaoAnterior.horaInicio,
      duracaoMinutos:
        duracaoMinutos !== undefined
          ? Number(duracaoMinutos)
          : irrigacaoAnterior.duracaoMinutos,
      diasSemana: diasSemana || irrigacaoAnterior.diasSemana,
      status: "AGENDADO"
    };

    const statusAutomatico = calcularStatusAutomatico(dadosParaCalcular);

    const irrigacao = await prisma.irrigacao.update({
      where: { id },
      data: {
        talhaoId,
        tipoIrrigacao,
        horaInicio,
        duracaoMinutos:
          duracaoMinutos !== undefined ? Number(duracaoMinutos) : undefined,
        diasSemana,
        status: statusAutomatico
      },
      include: {
        talhao: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "EDITAR_PROGRAMACAO_IRRIGACAO",
      entidade: "Irrigacao",
      entidadeId: irrigacao.id,
      descricao: `Programação de irrigação atualizada para o ${irrigacao.talhao.nome}.`,
      dadosAnteriores: irrigacaoAnterior,
      dadosNovos: irrigacao
    });

    await verificarAlertaIrrigacao(irrigacao);

    return res.json({
      message: "Irrigação atualizada com sucesso",
      irrigacao
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar irrigação",
      error: error.message
    });
  }
}

async function alterarStatusIrrigacao(
  req,
  res,
  novoStatus,
  acaoHistorico,
  mensagemHistorico
) {
  try {
    const { id } = req.params;

    const irrigacaoAnterior = await prisma.irrigacao.findUnique({
      where: { id },
      include: {
        talhao: true
      }
    });

    if (!irrigacaoAnterior) {
      return res.status(404).json({
        message: "Irrigação não encontrada"
      });
    }

    const irrigacao = await prisma.irrigacao.update({
      where: { id },
      data: {
        status: novoStatus
      },
      include: {
        talhao: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: acaoHistorico,
      entidade: "Irrigacao",
      entidadeId: irrigacao.id,
      descricao: mensagemHistorico,
      dadosAnteriores: irrigacaoAnterior,
      dadosNovos: irrigacao
    });

    await verificarAlertaIrrigacao(irrigacao);

    return res.json({
      message: "Status da irrigação alterado com sucesso",
      irrigacao
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao alterar status da irrigação",
      error: error.message
    });
  }
}

async function pausarIrrigacao(req, res) {
  return alterarStatusIrrigacao(
    req,
    res,
    "PAUSADO",
    "PAUSAR_IRRIGACAO",
    "Programação de irrigação pausada."
  );
}

async function ativarIrrigacao(req, res) {
  try {
    const { id } = req.params;

    const irrigacaoAnterior = await prisma.irrigacao.findUnique({
      where: { id },
      include: {
        talhao: true
      }
    });

    if (!irrigacaoAnterior) {
      return res.status(404).json({
        message: "Irrigação não encontrada"
      });
    }

    const statusAutomatico = calcularStatusAutomatico({
      horaInicio: irrigacaoAnterior.horaInicio,
      duracaoMinutos: irrigacaoAnterior.duracaoMinutos,
      diasSemana: irrigacaoAnterior.diasSemana,
      status: "AGENDADO"
    });

    const irrigacao = await prisma.irrigacao.update({
      where: { id },
      data: {
        status: statusAutomatico
      },
      include: {
        talhao: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "ATIVAR_IRRIGACAO",
      entidade: "Irrigacao",
      entidadeId: irrigacao.id,
      descricao: "Programação de irrigação reativada.",
      dadosAnteriores: irrigacaoAnterior,
      dadosNovos: irrigacao
    });

    await verificarAlertaIrrigacao(irrigacao);

    return res.json({
      message: "Irrigação reativada com sucesso",
      irrigacao
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao ativar irrigação",
      error: error.message
    });
  }
}

async function concluirIrrigacao(req, res) {
  return alterarStatusIrrigacao(
    req,
    res,
    "CONCLUIDO",
    "CONCLUIR_IRRIGACAO",
    "Programação de irrigação concluída."
  );
}

async function removerIrrigacao(req, res) {
  try {
    const { id } = req.params;

    const irrigacaoAnterior = await prisma.irrigacao.findUnique({
      where: { id },
      include: {
        talhao: true
      }
    });

    if (!irrigacaoAnterior) {
      return res.status(404).json({
        message: "Irrigação não encontrada"
      });
    }

    await prisma.irrigacao.delete({
      where: { id }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "REMOVER_PROGRAMACAO_IRRIGACAO",
      entidade: "Irrigacao",
      entidadeId: id,
      descricao: `Programação de irrigação removida do ${irrigacaoAnterior.talhao.nome}.`,
      dadosAnteriores: irrigacaoAnterior
    });

    await verificarAlertaIrrigacao({
      ...irrigacaoAnterior,
      status: "CONCLUIDO"
    });

    return res.json({
      message: "Irrigação removida com sucesso"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover irrigação",
      error: error.message
    });
  }
}

module.exports = {
  listarIrrigacoes,
  buscarIrrigacaoPorId,
  criarIrrigacao,
  atualizarIrrigacao,
  pausarIrrigacao,
  ativarIrrigacao,
  concluirIrrigacao,
  removerIrrigacao
};
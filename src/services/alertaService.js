const prisma = require("../database/prismaClient");
const { registrarHistorico } = require("./historicoService");

async function criarAlertaSeNaoExistir({
  tipo,
  severidade,
  descricao,
  talhaoId,
  estoqueId
}) {
  const where = {
    tipo,
    status: {
      not: "SOLUCIONADO"
    }
  };

  if (talhaoId) {
    where.talhaoId = talhaoId;
  }

  if (estoqueId) {
    where.estoqueId = estoqueId;
  }

  const alertaExistente = await prisma.alerta.findFirst({
    where
  });

  if (alertaExistente) {
    return alertaExistente;
  }

  const alerta = await prisma.alerta.create({
    data: {
      descricao,
      tipo,
      severidade,
      status: "ABERTO",
      talhaoId: talhaoId || null,
      estoqueId: estoqueId || null
    }
  });

  await registrarHistorico({
    usuarioId: null,
    acao: "CRIAR_ALERTA_AUTOMATICO",
    entidade: "Alerta",
    entidadeId: alerta.id,
    descricao: `Alerta automático criado: ${descricao}`,
    dadosNovos: alerta
  });

  return alerta;
}

async function solucionarAlertasAutomaticos({ tipo, talhaoId, estoqueId }) {
  const where = {
    tipo,
    status: {
      not: "SOLUCIONADO"
    }
  };

  if (talhaoId) {
    where.talhaoId = talhaoId;
  }

  if (estoqueId) {
    where.estoqueId = estoqueId;
  }

  const alertas = await prisma.alerta.findMany({
    where
  });

  for (const alerta of alertas) {
    const alertaAtualizado = await prisma.alerta.update({
      where: {
        id: alerta.id
      },
      data: {
        status: "SOLUCIONADO",
        resolvedAt: new Date()
      }
    });

    await registrarHistorico({
      usuarioId: null,
      acao: "SOLUCIONAR_ALERTA_AUTOMATICO",
      entidade: "Alerta",
      entidadeId: alertaAtualizado.id,
      descricao: `Alerta automático solucionado: ${alertaAtualizado.descricao}`,
      dadosAnteriores: alerta,
      dadosNovos: alertaAtualizado
    });
  }
}

async function verificarAlertaEstoque(item) {
  if (Number(item.quantidadeEstoque) <= Number(item.estoqueMinimo)) {
    return criarAlertaSeNaoExistir({
      tipo: "ESTOQUE",
      severidade: "CRITICO",
      estoqueId: item.id,
      descricao: `Estoque de ${item.nomeProduto} abaixo do mínimo recomendado.`
    });
  }

  return solucionarAlertasAutomaticos({
    tipo: "ESTOQUE",
    estoqueId: item.id
  });
}

async function verificarAlertaTalhao(talhao) {
  if (talhao.status === "INATIVO") {
    return solucionarAlertasAutomaticos({
      tipo: "TALHAO",
      talhaoId: talhao.id
    });
  }

  const umidadeBaixa =
    talhao.umidadeSolo !== null &&
    talhao.umidadeSolo !== undefined &&
    Number(talhao.umidadeSolo) <= 30;

  const talhaoSeco = talhao.status === "SECO";

  if (talhaoSeco || umidadeBaixa) {
    return criarAlertaSeNaoExistir({
      tipo: "TALHAO",
      severidade: "ALERTA",
      talhaoId: talhao.id,
      descricao: `Talhão ${talhao.nome} apresenta condição crítica de umidade.`
    });
  }

  return solucionarAlertasAutomaticos({
    tipo: "TALHAO",
    talhaoId: talhao.id
  });
}

async function verificarAlertaIrrigacao(irrigacao) {
  if (irrigacao.status === "PENDENTE" || irrigacao.status === "PAUSADO") {
    return criarAlertaSeNaoExistir({
      tipo: "IRRIGACAO",
      severidade: "ALERTA",
      talhaoId: irrigacao.talhaoId,
      descricao: `Irrigação do talhão está ${irrigacao.status.toLowerCase()}.`
    });
  }

  return solucionarAlertasAutomaticos({
    tipo: "IRRIGACAO",
    talhaoId: irrigacao.talhaoId
  });
}

module.exports = {
  criarAlertaSeNaoExistir,
  solucionarAlertasAutomaticos,
  verificarAlertaEstoque,
  verificarAlertaTalhao,
  verificarAlertaIrrigacao
};
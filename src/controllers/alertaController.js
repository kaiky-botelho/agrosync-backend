const prisma = require("../database/prismaClient");
const { registrarHistorico } = require("../services/historicoService");

async function listarAlertas(req, res) {
  try {
    const { status, severidade, tipo } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (severidade) {
      where.severidade = severidade;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const alertas = await prisma.alerta.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        talhao: true,
        estoque: true
      }
    });

    return res.json(alertas);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar alertas",
      error: error.message
    });
  }
}

async function buscarAlertaPorId(req, res) {
  try {
    const { id } = req.params;

    const alerta = await prisma.alerta.findUnique({
      where: { id },
      include: {
        talhao: true,
        estoque: true
      }
    });

    if (!alerta) {
      return res.status(404).json({
        message: "Alerta não encontrado"
      });
    }

    return res.json(alerta);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar alerta",
      error: error.message
    });
  }
}

async function criarAlerta(req, res) {
  try {
    const {
      descricao,
      tipo,
      severidade,
      status,
      talhaoId,
      estoqueId
    } = req.body;

    if (!descricao || !tipo || !severidade) {
      return res.status(400).json({
        message: "Descrição, tipo e severidade são obrigatórios"
      });
    }

    if (talhaoId) {
      const talhao = await prisma.talhao.findUnique({
        where: { id: talhaoId }
      });

      if (!talhao) {
        return res.status(404).json({
          message: "Talhão não encontrado"
        });
      }
    }

    if (estoqueId) {
      const estoque = await prisma.estoque.findUnique({
        where: { id: estoqueId }
      });

      if (!estoque) {
        return res.status(404).json({
          message: "Item de estoque não encontrado"
        });
      }
    }

    const alerta = await prisma.alerta.create({
      data: {
        descricao,
        tipo,
        severidade,
        status: status || "ABERTO",
        talhaoId: talhaoId || null,
        estoqueId: estoqueId || null
      },
      include: {
        talhao: true,
        estoque: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "CRIAR_ALERTA",
      entidade: "Alerta",
      entidadeId: alerta.id,
      descricao: `Alerta criado: ${alerta.descricao}`,
      dadosNovos: alerta
    });

    return res.status(201).json({
      message: "Alerta criado com sucesso",
      alerta
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar alerta",
      error: error.message
    });
  }
}

async function atualizarAlerta(req, res) {
  try {
    const { id } = req.params;

    const alertaAnterior = await prisma.alerta.findUnique({
      where: { id }
    });

    if (!alertaAnterior) {
      return res.status(404).json({
        message: "Alerta não encontrado"
      });
    }

    const {
      descricao,
      tipo,
      severidade,
      status,
      talhaoId,
      estoqueId
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
    }

    if (estoqueId) {
      const estoque = await prisma.estoque.findUnique({
        where: { id: estoqueId }
      });

      if (!estoque) {
        return res.status(404).json({
          message: "Item de estoque não encontrado"
        });
      }
    }

    const alerta = await prisma.alerta.update({
      where: { id },
      data: {
        descricao,
        tipo,
        severidade,
        status,
        talhaoId,
        estoqueId
      },
      include: {
        talhao: true,
        estoque: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "EDITAR_ALERTA",
      entidade: "Alerta",
      entidadeId: alerta.id,
      descricao: `Alerta atualizado: ${alerta.descricao}`,
      dadosAnteriores: alertaAnterior,
      dadosNovos: alerta
    });

    return res.json({
      message: "Alerta atualizado com sucesso",
      alerta
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar alerta",
      error: error.message
    });
  }
}

async function solucionarAlerta(req, res) {
  try {
    const { id } = req.params;

    const alertaAnterior = await prisma.alerta.findUnique({
      where: { id }
    });

    if (!alertaAnterior) {
      return res.status(404).json({
        message: "Alerta não encontrado"
      });
    }

    if (alertaAnterior.status === "SOLUCIONADO") {
      return res.status(400).json({
        message: "Este alerta já está solucionado"
      });
    }

    const alerta = await prisma.alerta.update({
      where: { id },
      data: {
        status: "SOLUCIONADO",
        resolvedAt: new Date()
      },
      include: {
        talhao: true,
        estoque: true
      }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "SOLUCIONAR_ALERTA",
      entidade: "Alerta",
      entidadeId: alerta.id,
      descricao: `Alerta solucionado: ${alerta.descricao}`,
      dadosAnteriores: alertaAnterior,
      dadosNovos: alerta
    });

    return res.json({
      message: "Alerta solucionado com sucesso",
      alerta
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao solucionar alerta",
      error: error.message
    });
  }
}

async function removerAlerta(req, res) {
  try {
    const { id } = req.params;

    const alertaAnterior = await prisma.alerta.findUnique({
      where: { id }
    });

    if (!alertaAnterior) {
      return res.status(404).json({
        message: "Alerta não encontrado"
      });
    }

    await prisma.alerta.delete({
      where: { id }
    });

    await registrarHistorico({
      usuarioId: req.usuario.id,
      acao: "REMOVER_ALERTA",
      entidade: "Alerta",
      entidadeId: id,
      descricao: `Alerta removido: ${alertaAnterior.descricao}`,
      dadosAnteriores: alertaAnterior
    });

    return res.json({
      message: "Alerta removido com sucesso"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover alerta",
      error: error.message
    });
  }
}

module.exports = {
  listarAlertas,
  buscarAlertaPorId,
  criarAlerta,
  atualizarAlerta,
  solucionarAlerta,
  removerAlerta
};
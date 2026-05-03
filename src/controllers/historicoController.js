const prisma = require("../database/prismaClient");

async function listarHistoricos(req, res) {
    try {
        const { entidade, usuarioId, acao } = req.query;

        const where = {};

        if (entidade) {
            where.entidade = entidade;
        }

        if (usuarioId) {
            where.usuarioId = usuarioId;
        }

        if (acao) {
            where.acao = acao;
        }

        const historicos = await prisma.historico.findMany({
            where,
            orderBy: {
                createdAt: "desc"
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return res.json(historicos);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar históricos",
            error: error.message
        });
    }
}

async function buscarHistoricoPorId(req, res) {
    try {
        const { id } = req.params;

        const historico = await prisma.historico.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!historico) {
            return res.status(404).json({
                message: "Histórico não encontrado"
            });
        }

        return res.json(historico);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar histórico",
            error: error.message
        });
    }
}

async function listarHistoricoPorUsuario(req, res) {
    try {
        const { usuarioId } = req.params;

        const historicos = await prisma.historico.findMany({
            where: {
                usuarioId
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return res.json(historicos);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar histórico do usuário",
            error: error.message
        });
    }
}

async function listarHistoricoPorEntidade(req, res) {
    try {
        const { entidade, entidadeId } = req.params;

        const historicos = await prisma.historico.findMany({
            where: {
                entidade,
                entidadeId
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return res.json(historicos);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar histórico da entidade",
            error: error.message
        });
    }
}

module.exports = {
    listarHistoricos,
    buscarHistoricoPorId,
    listarHistoricoPorUsuario,
    listarHistoricoPorEntidade
};
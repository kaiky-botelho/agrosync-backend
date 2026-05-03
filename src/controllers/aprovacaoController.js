const prisma = require("../database/prismaClient");
const { registrarHistorico } = require("../services/historicoService");

async function listarSolicitacoesDesativacao(req, res) {
    try {
        const { status } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        const solicitacoes = await prisma.solicitacaoDesativacao.findMany({
            where,
            orderBy: {
                createdAt: "desc"
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
                },
                respondidoPor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return res.json(solicitacoes);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar solicitações de desativação",
            error: error.message
        });
    }
}

async function buscarSolicitacaoDesativacaoPorId(req, res) {
    try {
        const { id } = req.params;

        const solicitacao = await prisma.solicitacaoDesativacao.findUnique({
            where: { id },
            include: {
                talhao: true,
                solicitadoPor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                },
                respondidoPor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!solicitacao) {
            return res.status(404).json({
                message: "Solicitação não encontrada"
            });
        }

        return res.json(solicitacao);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar solicitação",
            error: error.message
        });
    }
}

async function aprovarSolicitacaoDesativacao(req, res) {
    try {
        const { id } = req.params;
        const { observacaoResposta } = req.body;

        const solicitacao = await prisma.solicitacaoDesativacao.findUnique({
            where: { id },
            include: {
                talhao: true
            }
        });

        if (!solicitacao) {
            return res.status(404).json({
                message: "Solicitação não encontrada"
            });
        }

        if (solicitacao.status !== "PENDENTE") {
            return res.status(400).json({
                message: "Esta solicitação já foi respondida"
            });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const solicitacaoAtualizada = await tx.solicitacaoDesativacao.update({
                where: { id },
                data: {
                    status: "APROVADA",
                    respondidoPorId: req.usuario.id,
                    observacaoResposta,
                    respondedAt: new Date()
                },
                include: {
                    talhao: true,
                    solicitadoPor: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    },
                    respondidoPor: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                }
            });

            const talhaoAtualizado = await tx.talhao.update({
                where: {
                    id: solicitacao.talhaoId
                },
                data: {
                    status: "INATIVO"
                }
            });

            return {
                solicitacaoAtualizada,
                talhaoAtualizado
            };
        });

        await registrarHistorico({
            usuarioId: req.usuario.id,
            acao: "APROVAR_DESATIVACAO_TALHAO",
            entidade: "SolicitacaoDesativacao",
            entidadeId: id,
            descricao: `Solicitação de desativação do talhão ${solicitacao.talhao.nome} aprovada.`,
            dadosAnteriores: solicitacao,
            dadosNovos: resultado
        });

        return res.json({
            message: "Solicitação aprovada com sucesso",
            solicitacao: resultado.solicitacaoAtualizada,
            talhao: resultado.talhaoAtualizado
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao aprovar solicitação",
            error: error.message
        });
    }
}

async function recusarSolicitacaoDesativacao(req, res) {
    try {
        const { id } = req.params;
        const { observacaoResposta } = req.body;

        const solicitacao = await prisma.solicitacaoDesativacao.findUnique({
            where: { id },
            include: {
                talhao: true
            }
        });

        if (!solicitacao) {
            return res.status(404).json({
                message: "Solicitação não encontrada"
            });
        }

        if (solicitacao.status !== "PENDENTE") {
            return res.status(400).json({
                message: "Esta solicitação já foi respondida"
            });
        }

        const solicitacaoAtualizada = await prisma.solicitacaoDesativacao.update({
            where: { id },
            data: {
                status: "RECUSADA",
                respondidoPorId: req.usuario.id,
                observacaoResposta,
                respondedAt: new Date()
            },
            include: {
                talhao: true,
                solicitadoPor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                respondidoPor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });

        await registrarHistorico({
            usuarioId: req.usuario.id,
            acao: "RECUSAR_DESATIVACAO_TALHAO",
            entidade: "SolicitacaoDesativacao",
            entidadeId: id,
            descricao: `Solicitação de desativação do talhão ${solicitacao.talhao.nome} recusada.`,
            dadosAnteriores: solicitacao,
            dadosNovos: solicitacaoAtualizada
        });

        return res.json({
            message: "Solicitação recusada com sucesso",
            solicitacao: solicitacaoAtualizada
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao recusar solicitação",
            error: error.message
        });
    }
}

module.exports = {
    listarSolicitacoesDesativacao,
    buscarSolicitacaoDesativacaoPorId,
    aprovarSolicitacaoDesativacao,
    recusarSolicitacaoDesativacao
};
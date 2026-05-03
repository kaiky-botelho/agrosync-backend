const prisma = require("../database/prismaClient");
const { registrarHistorico } = require("../services/historicoService");
const { verificarAlertaEstoque } = require("../services/alertaService");

function calcularStatusEstoque(quantidadeEstoque, estoqueMinimo) {
    return Number(quantidadeEstoque) <= Number(estoqueMinimo) ? "BAIXO" : "OK";
}

async function listarEstoque(req, res) {
    try {
        const itens = await prisma.estoque.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                movimentacoes: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 5,
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nome: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return res.json(itens);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar estoque",
            error: error.message
        });
    }
}

async function buscarItemEstoquePorId(req, res) {
    try {
        const { id } = req.params;

        const item = await prisma.estoque.findUnique({
            where: { id },
            include: {
                movimentacoes: {
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
                },
                alertas: true
            }
        });

        if (!item) {
            return res.status(404).json({
                message: "Item de estoque não encontrado"
            });
        }

        return res.json(item);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar item de estoque",
            error: error.message
        });
    }
}

async function criarItemEstoque(req, res) {
    try {
        const {
            nomeProduto,
            categoria,
            unidade,
            quantidadeEstoque,
            estoqueMinimo
        } = req.body;

        if (
            !nomeProduto ||
            !categoria ||
            !unidade ||
            quantidadeEstoque === undefined ||
            estoqueMinimo === undefined
        ) {
            return res.status(400).json({
                message: "Nome, categoria, unidade, quantidade e estoque mínimo são obrigatórios"
            });
        }

        const status = calcularStatusEstoque(quantidadeEstoque, estoqueMinimo);

        const item = await prisma.estoque.create({
            data: {
                nomeProduto,
                categoria,
                unidade,
                quantidadeEstoque: Number(quantidadeEstoque),
                estoqueMinimo: Number(estoqueMinimo),
                status
            }
        });

        await registrarHistorico({
            usuarioId: req.usuario.id,
            acao: "ADICIONAR_INSUMO",
            entidade: "Estoque",
            entidadeId: item.id,
            descricao: `Item ${item.nomeProduto} adicionado ao estoque.`,
            dadosNovos: item
        });

        await verificarAlertaEstoque(item);

        return res.status(201).json({
            message: "Item de estoque criado com sucesso",
            item
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao criar item de estoque",
            error: error.message
        });
    }
}

async function atualizarItemEstoque(req, res) {
    try {
        const { id } = req.params;

        const itemAnterior = await prisma.estoque.findUnique({
            where: { id }
        });

        if (!itemAnterior) {
            return res.status(404).json({
                message: "Item de estoque não encontrado"
            });
        }

        const {
            nomeProduto,
            categoria,
            unidade,
            quantidadeEstoque,
            estoqueMinimo
        } = req.body;

        const novaQuantidade =
            quantidadeEstoque !== undefined
                ? Number(quantidadeEstoque)
                : itemAnterior.quantidadeEstoque;

        const novoEstoqueMinimo =
            estoqueMinimo !== undefined
                ? Number(estoqueMinimo)
                : itemAnterior.estoqueMinimo;

        const status = calcularStatusEstoque(novaQuantidade, novoEstoqueMinimo);

        const item = await prisma.estoque.update({
            where: { id },
            data: {
                nomeProduto,
                categoria,
                unidade,
                quantidadeEstoque:
                    quantidadeEstoque !== undefined ? Number(quantidadeEstoque) : undefined,
                estoqueMinimo:
                    estoqueMinimo !== undefined ? Number(estoqueMinimo) : undefined,
                status
            }
        });

        await registrarHistorico({
            usuarioId: req.usuario.id,
            acao: "EDITAR_INSUMO",
            entidade: "Estoque",
            entidadeId: item.id,
            descricao: `Item ${item.nomeProduto} atualizado no estoque.`,
            dadosAnteriores: itemAnterior,
            dadosNovos: item
        });

        await verificarAlertaEstoque(item);

        return res.json({
            message: "Item de estoque atualizado com sucesso",
            item
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao atualizar item de estoque",
            error: error.message
        });
    }
}

async function movimentarEstoque(req, res) {
    try {
        const { id } = req.params;
        const { tipo, quantidade, observacao } = req.body;

        if (!tipo || quantidade === undefined) {
            return res.status(400).json({
                message: "Tipo e quantidade são obrigatórios"
            });
        }

        if (!["ENTRADA", "SAIDA", "AJUSTE"].includes(tipo)) {
            return res.status(400).json({
                message: "Tipo de movimentação inválido"
            });
        }

        const itemAnterior = await prisma.estoque.findUnique({
            where: { id }
        });

        if (!itemAnterior) {
            return res.status(404).json({
                message: "Item de estoque não encontrado"
            });
        }

        let novaQuantidade = itemAnterior.quantidadeEstoque;

        if (tipo === "ENTRADA") {
            novaQuantidade += Number(quantidade);
        }

        if (tipo === "SAIDA") {
            if (Number(quantidade) > itemAnterior.quantidadeEstoque) {
                return res.status(400).json({
                    message: "Quantidade de saída maior que o estoque disponível"
                });
            }

            novaQuantidade -= Number(quantidade);
        }

        if (tipo === "AJUSTE") {
            novaQuantidade = Number(quantidade);
        }

        const novoStatus = calcularStatusEstoque(
            novaQuantidade,
            itemAnterior.estoqueMinimo
        );

        const resultado = await prisma.$transaction(async (tx) => {
            const movimentacao = await tx.movimentacaoEstoque.create({
                data: {
                    estoqueId: id,
                    usuarioId: req.usuario.id,
                    tipo,
                    quantidade: Number(quantidade),
                    observacao
                }
            });

            const itemAtualizado = await tx.estoque.update({
                where: { id },
                data: {
                    quantidadeEstoque: novaQuantidade,
                    status: novoStatus
                }
            });

            return {
                movimentacao,
                itemAtualizado
            };
        });

        await registrarHistorico({
            usuarioId: req.usuario.id,
            acao: "MOVIMENTAR_ESTOQUE",
            entidade: "Estoque",
            entidadeId: id,
            descricao: `Movimentação ${tipo} realizada no item ${itemAnterior.nomeProduto}.`,
            dadosAnteriores: itemAnterior,
            dadosNovos: resultado
        });

        await verificarAlertaEstoque(resultado.itemAtualizado);

        return res.json({
            message: "Movimentação realizada com sucesso",
            movimentacao: resultado.movimentacao,
            item: resultado.itemAtualizado
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao movimentar estoque",
            error: error.message
        });
    }
}

async function removerItemEstoque(req, res) {
    try {
        const { id } = req.params;

        const itemAnterior = await prisma.estoque.findUnique({
            where: { id }
        });

        if (!itemAnterior) {
            return res.status(404).json({
                message: "Item de estoque não encontrado"
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.alerta.deleteMany({
                where: {
                    estoqueId: id
                }
            });

            await tx.movimentacaoEstoque.deleteMany({
                where: {
                    estoqueId: id
                }
            });

            await tx.estoque.delete({
                where: { id }
            });
        });

        await registrarHistorico({
            usuarioId: req.usuario.id,
            acao: "REMOVER_INSUMO",
            entidade: "Estoque",
            entidadeId: id,
            descricao: `Item ${itemAnterior.nomeProduto} removido do estoque.`,
            dadosAnteriores: itemAnterior
        });

        return res.json({
            message: "Item de estoque removido com sucesso"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover item de estoque",
            error: error.message
        });
    }
}

module.exports = {
    listarEstoque,
    buscarItemEstoquePorId,
    criarItemEstoque,
    atualizarItemEstoque,
    movimentarEstoque,
    removerItemEstoque
};
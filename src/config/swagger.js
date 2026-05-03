const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AgroSync API",
            version: "1.0.0",
            description: "Documentação da API do sistema AgroSync"
        },
        servers: [
            {
                url: process.env.API_URL || "http://localhost:3000",
                description: "Servidor da API"
            }
        ],
tags: [
    { name: "Auth" },
    { name: "Usuários" },
    { name: "Talhões" },
    { name: "Aprovações" },
    { name: "Históricos" },
    { name: "Estoque" },
    { name: "Irrigações" },
    { name: "Alertas" },
    { name: "Dashboard" },
    { name: "Mapa" }
],
    components: {
    securitySchemes: {
        bearerAuth: {
            type: "http",
                scheme: "bearer",
                    bearerFormat: "JWT"
        }
    }
},
paths: {
    "/auth/login": {
        post: {
            tags: ["Auth"],
                summary: "Realiza login no sistema",
                    requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            email: "admin@agrosync.com",
                                senha: "123456"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Login realizado com sucesso"
                },
                401: {
                    description: "Credenciais inválidas"
                }
            }
        }
    },

    "/auth/me": {
        get: {
            tags: ["Auth"],
                summary: "Retorna os dados do usuário logado",
                    security: [{ bearerAuth: [] }],
                        responses: {
                200: {
                    description: "Usuário autenticado"
                },
                401: {
                    description: "Token inválido ou não informado"
                }
            }
        }
    },

    "/usuarios": {
        get: {
            tags: ["Usuários"],
                summary: "Lista todos os usuários",
                    security: [{ bearerAuth: [] }],
                        responses: {
                200: {
                    description: "Lista de usuários"
                }
            }
        },
        post: {
            tags: ["Usuários"],
                summary: "Cria um novo usuário",
                    security: [{ bearerAuth: [] }],
                        requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            nome: "João Oliveira",
                                email: "joao@email.com",
                                    senha: "123456",
                                        matricula: "0002",
                                            dataNascimento: "2000-05-10",
                                                setor: "Operações",
                                                    cargo: "Operador Agrícola",
                                                        role: "OPERADOR",
                                                            status: "ATIVO"
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Usuário criado com sucesso"
                }
            }
        }
    },

    "/usuarios/{id}": {
        get: {
            tags: ["Usuários"],
                summary: "Busca um usuário por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Usuário encontrado"
                }
            }
        },
        patch: {
            tags: ["Usuários"],
                summary: "Atualiza um usuário",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            nome: "João Oliveira Atualizado",
                                setor: "Irrigação",
                                    cargo: "Operador",
                                        role: "OPERADOR",
                                            status: "ATIVO"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Usuário atualizado"
                }
            }
        },
        delete: {
            tags: ["Usuários"],
                summary: "Inativa um usuário",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Usuário inativado"
                }
            }
        }
    },

    "/usuarios/{id}/status": {
        patch: {
            tags: ["Usuários"],
                summary: "Altera o status de um usuário",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            status: "INATIVO"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Status alterado"
                }
            }
        }
    },

    "/talhoes": {
        get: {
            tags: ["Talhões"],
                summary: "Lista todos os talhões",
                    security: [{ bearerAuth: [] }],
                        responses: {
                200: {
                    description: "Lista de talhões"
                }
            }
        },
        post: {
            tags: ["Talhões"],
                summary: "Cria um novo talhão",
                    security: [{ bearerAuth: [] }],
                        requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            nome: "Talhão G7",
                                cultura: "SOJA",
                                    areaHectares: 43,
                                        tipoSolo: "MISTO",
                                            status: "IRRIGANDO",
                                                umidadeSolo: 55,
                                                    temperatura: 23,
                                                        latitude: -20.5389,
                                                            longitude: -47.4008
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Talhão criado"
                }
            }
        }
    },

    "/talhoes/{id}": {
        get: {
            tags: ["Talhões"],
                summary: "Busca um talhão por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Talhão encontrado"
                }
            }
        },
        patch: {
            tags: ["Talhões"],
                summary: "Atualiza um talhão",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            status: "SECO",
                                umidadeSolo: 25,
                                    temperatura: 31
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Talhão atualizado"
                }
            }
        }
    },

    "/talhoes/{id}/solicitar-desativacao": {
        post: {
            tags: ["Talhões"],
                summary: "Solicita desativação de um talhão",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            justificativa: "Talhão será desativado por encerramento do ciclo de cultivo."
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Solicitação criada"
                }
            }
        }
    },

    "/aprovacoes/desativacoes": {
        get: {
            tags: ["Aprovações"],
                summary: "Lista solicitações de desativação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "status",
                                in: "query",
                                required: false,
                                schema: {
                                    type: "string",
                                    enum: ["PENDENTE", "APROVADA", "RECUSADA"]
                                }
                            }
                        ],
                            responses: {
                200: {
                    description: "Lista de solicitações"
                }
            }
        }
    },

    "/aprovacoes/desativacoes/{id}": {
        get: {
            tags: ["Aprovações"],
                summary: "Busca solicitação de desativação por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Solicitação encontrada"
                }
            }
        }
    },

    "/aprovacoes/desativacoes/{id}/aprovar": {
        patch: {
            tags: ["Aprovações"],
                summary: "Aprova uma solicitação de desativação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: false,
                    content: {
                    "application/json": {
                        example: {
                            observacaoResposta: "Solicitação aprovada pelo gestor."
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Solicitação aprovada"
                }
            }
        }
    },

    "/aprovacoes/desativacoes/{id}/recusar": {
        patch: {
            tags: ["Aprovações"],
                summary: "Recusa uma solicitação de desativação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: false,
                    content: {
                    "application/json": {
                        example: {
                            observacaoResposta: "Solicitação recusada por falta de informações."
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Solicitação recusada"
                }
            }
        }
    },

    "/estoque": {
        get: {
            tags: ["Estoque"],
                summary: "Lista itens do estoque",
                    security: [{ bearerAuth: [] }],
                        responses: {
                200: {
                    description: "Lista de itens"
                }
            }
        },
        post: {
            tags: ["Estoque"],
                summary: "Cria um item de estoque",
                    security: [{ bearerAuth: [] }],
                        requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            nomeProduto: "Semente de Milho",
                                categoria: "SEMENTE",
                                    unidade: "KG",
                                        quantidadeEstoque: 20,
                                            estoqueMinimo: 50
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Item criado"
                }
            }
        }
    },

    "/estoque/{id}": {
        get: {
            tags: ["Estoque"],
                summary: "Busca item de estoque por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Item encontrado"
                }
            }
        },
        patch: {
            tags: ["Estoque"],
                summary: "Atualiza item de estoque",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            quantidadeEstoque: 80,
                                estoqueMinimo: 50
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Item atualizado"
                }
            }
        },
        delete: {
            tags: ["Estoque"],
                summary: "Remove item de estoque",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Item removido"
                }
            }
        }
    },

    "/estoque/{id}/movimentar": {
        post: {
            tags: ["Estoque"],
                summary: "Movimenta estoque",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            tipo: "ENTRADA",
                                quantidade: 40,
                                    observacao: "Reposição de estoque"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Movimentação realizada"
                }
            }
        }
    },

    "/irrigacoes": {
        get: {
            tags: ["Irrigações"],
                summary: "Lista programações de irrigação",
                    security: [{ bearerAuth: [] }],
                        responses: {
                200: {
                    description: "Lista de irrigações"
                }
            }
        },
        post: {
            tags: ["Irrigações"],
                summary: "Cria programação de irrigação",
                    security: [{ bearerAuth: [] }],
                        requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            talhaoId: "ID_DO_TALHAO",
                                tipoIrrigacao: "GOTEJAMENTO",
                                    horaInicio: "06:30",
                                        duracaoMinutos: 45,
                                            diasSemana: ["SEGUNDA", "QUARTA", "SEXTA"],
                                                status: "AGENDADO"
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Irrigação criada"
                }
            }
        }
    },

    "/irrigacoes/{id}": {
        get: {
            tags: ["Irrigações"],
                summary: "Busca irrigação por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Irrigação encontrada"
                }
            }
        },
        patch: {
            tags: ["Irrigações"],
                summary: "Atualiza irrigação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            horaInicio: "07:00",
                                duracaoMinutos: 60,
                                    status: "ATIVO"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Irrigação atualizada"
                }
            }
        },
        delete: {
            tags: ["Irrigações"],
                summary: "Remove irrigação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Irrigação removida"
                }
            }
        }
    },

    "/irrigacoes/{id}/pausar": {
        patch: {
            tags: ["Irrigações"],
                summary: "Pausa uma irrigação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Irrigação pausada"
                }
            }
        }
    },

    "/irrigacoes/{id}/ativar": {
        patch: {
            tags: ["Irrigações"],
                summary: "Ativa uma irrigação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Irrigação ativada"
                }
            }
        }
    },

    "/irrigacoes/{id}/concluir": {
        patch: {
            tags: ["Irrigações"],
                summary: "Conclui uma irrigação",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Irrigação concluída"
                }
            }
        }
    },

    "/alertas": {
        get: {
            tags: ["Alertas"],
                summary: "Lista alertas",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "status",
                                in: "query",
                                required: false,
                                schema: {
                                    type: "string",
                                    enum: ["ABERTO", "EM_ANALISE", "SOLUCIONADO"]
                                }
                            },
                            {
                                name: "severidade",
                                in: "query",
                                required: false,
                                schema: {
                                    type: "string",
                                    enum: ["CRITICO", "ALERTA", "INFO", "OK"]
                                }
                            }
                        ],
                            responses: {
                200: {
                    description: "Lista de alertas"
                }
            }
        },
        post: {
            tags: ["Alertas"],
                summary: "Cria alerta manualmente",
                    description: "No fluxo principal, os alertas são gerados automaticamente pelo sistema.",
                        security: [{ bearerAuth: [] }],
                            requestBody: {
                required: true,
                    content: {
                    "application/json": {
                        example: {
                            descricao: "Estoque de fertilizante abaixo do mínimo recomendado.",
                                tipo: "ESTOQUE",
                                    severidade: "CRITICO",
                                        status: "ABERTO"
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Alerta criado"
                }
            }
        }
    },

    "/alertas/{id}": {
        get: {
            tags: ["Alertas"],
                summary: "Busca alerta por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Alerta encontrado"
                }
            }
        },
        patch: {
            tags: ["Alertas"],
                summary: "Atualiza alerta",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Alerta atualizado"
                }
            }
        },
        delete: {
            tags: ["Alertas"],
                summary: "Remove alerta",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Alerta removido"
                }
            }
        }
    },

    "/alertas/{id}/solucionar": {
        patch: {
            tags: ["Alertas"],
                summary: "Soluciona um alerta",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Alerta solucionado"
                }
            }
        }
    },

    "/historicos": {
        get: {
            tags: ["Históricos"],
                summary: "Lista históricos do sistema",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "entidade",
                                in: "query",
                                required: false,
                                schema: { type: "string" }
                            },
                            {
                                name: "acao",
                                in: "query",
                                required: false,
                                schema: { type: "string" }
                            },
                            {
                                name: "usuarioId",
                                in: "query",
                                required: false,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Lista de históricos"
                }
            }
        }
    },

    "/historicos/{id}": {
        get: {
            tags: ["Históricos"],
                summary: "Busca histórico por ID",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Histórico encontrado"
                }
            }
        }
    },

    "/historicos/usuario/{usuarioId}": {
        get: {
            tags: ["Históricos"],
                summary: "Lista histórico por usuário",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "usuarioId",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Histórico do usuário"
                }
            }
        }
    },

    "/historicos/entidade/{entidade}/{entidadeId}": {
        get: {
            tags: ["Históricos"],
                summary: "Lista histórico por entidade",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "entidade",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            },
                            {
                                name: "entidadeId",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Histórico da entidade"
                }
            }
        }
    },

    "/dashboard/resumo": {
        get: {
            tags: ["Dashboard"],
                summary: "Retorna resumo geral do dashboard",
                    security: [{ bearerAuth: [] }],
                        responses: {
                200: {
                    description: "Resumo do dashboard"
                }
            }
        }
    },

    "/mapa/talhoes": {
        get: {
            tags: ["Mapa"],
                summary: "Lista talhões para exibição no mapa",
                    security: [{ bearerAuth: [] }],
                        parameters: [
                            {
                                name: "status",
                                in: "query",
                                required: false,
                                schema: { type: "string" }
                            },
                            {
                                name: "cultura",
                                in: "query",
                                required: false,
                                schema: { type: "string" }
                            }
                        ],
                            responses: {
                200: {
                    description: "Talhões do mapa"
                }
            }
        }
    }
}
  },
apis: []
});

module.exports = swaggerSpec;
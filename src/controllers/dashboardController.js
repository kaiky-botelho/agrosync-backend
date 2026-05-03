const prisma = require("../database/prismaClient");
const {
  atualizarMonitoramentoTalhoesAutomaticamente
} = require("../services/monitoramentoService");

function obterInicioDoDia(data) {
  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

function obterFimDoDia(data) {
  const fim = new Date(data);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

function formatarDiaSemana(data) {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return dias[data.getDay()];
}

function montarGraficoUmidadeHoje(leituras) {
  const grupos = {};

  for (const leitura of leituras) {
    const data = new Date(leitura.createdAt);
    const hora = `${String(data.getHours()).padStart(2, "0")}h`;

    if (!grupos[hora]) {
      grupos[hora] = {
        soma: 0,
        total: 0
      };
    }

    grupos[hora].soma += leitura.umidadeSolo;
    grupos[hora].total += 1;
  }

  return Object.entries(grupos).map(([hora, grupo]) => ({
    hora,
    valor: Number((grupo.soma / grupo.total).toFixed(1))
  }));
}

function montarGraficoConsumoSemana(consumos) {
  const hoje = new Date();
  const ultimosSeteDias = [];

  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    data.setHours(0, 0, 0, 0);

    ultimosSeteDias.push(data);
  }

  return ultimosSeteDias.map((data) => {
    const inicio = obterInicioDoDia(data);
    const fim = obterFimDoDia(data);

    const total = consumos
      .filter((consumo) => {
        const createdAt = new Date(consumo.createdAt);
        return createdAt >= inicio && createdAt <= fim;
      })
      .reduce((acc, consumo) => acc + Number(consumo.litros), 0);

    return {
      dia: formatarDiaSemana(data),
      valor: Number(total.toFixed(1))
    };
  });
}

async function obterResumoDashboard(req, res) {
  try {
    await atualizarMonitoramentoTalhoesAutomaticamente();

    const hoje = new Date();
    const inicioHoje = obterInicioDoDia(hoje);
    const fimHoje = obterFimDoDia(hoje);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6);
    inicioSemana.setHours(0, 0, 0, 0);

    const [
      totalTalhoes,
      talhoesAtivos,
      talhoesInativos,
      talhoesSecos,
      totalIrrigacoes,
      irrigacoesAtivas,
      irrigacoesPendentes,
      itensEstoqueBaixo,
      alertasAbertos,
      alertasCriticos,
      mediasTalhoes,
      filaIrrigacao,
      alertasRecentes,
      estoqueBaixo,
      leiturasHoje,
      consumosSemana
    ] = await Promise.all([
      prisma.talhao.count(),

      prisma.talhao.count({
        where: {
          status: {
            not: "INATIVO"
          }
        }
      }),

      prisma.talhao.count({
        where: {
          status: "INATIVO"
        }
      }),

      prisma.talhao.count({
        where: {
          status: "SECO"
        }
      }),

      prisma.irrigacao.count(),

      prisma.irrigacao.count({
        where: {
          status: "ATIVO"
        }
      }),

      prisma.irrigacao.count({
        where: {
          status: {
            in: ["PENDENTE", "AGENDADO", "PROXIMO"]
          }
        }
      }),

      prisma.estoque.count({
        where: {
          status: "BAIXO"
        }
      }),

      prisma.alerta.count({
        where: {
          status: {
            not: "SOLUCIONADO"
          }
        }
      }),

      prisma.alerta.count({
        where: {
          severidade: "CRITICO",
          status: {
            not: "SOLUCIONADO"
          }
        }
      }),

      prisma.talhao.aggregate({
        _avg: {
          umidadeSolo: true,
          temperatura: true
        }
      }),

      prisma.irrigacao.findMany({
        where: {
          status: {
            in: ["ATIVO", "PROXIMO", "PENDENTE", "AGENDADO"]
          }
        },
        orderBy: {
          horaInicio: "asc"
        },
        take: 10,
        include: {
          talhao: true
        }
      }),

      prisma.alerta.findMany({
        where: {
          status: {
            not: "SOLUCIONADO"
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        include: {
          talhao: true,
          estoque: true
        }
      }),

      prisma.estoque.findMany({
        where: {
          status: "BAIXO"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }),

      prisma.leituraTalhao.findMany({
        where: {
          createdAt: {
            gte: inicioHoje,
            lte: fimHoje
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }),

      prisma.consumoAgua.findMany({
        where: {
          createdAt: {
            gte: inicioSemana
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      })
    ]);

    return res.json({
      indicadores: {
        totalTalhoes,
        talhoesAtivos,
        talhoesInativos,
        talhoesSecos,
        totalIrrigacoes,
        irrigacoesAtivas,
        irrigacoesPendentes,
        itensEstoqueBaixo,
        alertasAbertos,
        alertasCriticos,
        umidadeMediaSolo: mediasTalhoes._avg.umidadeSolo
          ? Number(mediasTalhoes._avg.umidadeSolo.toFixed(2))
          : 0,
        temperaturaMedia: mediasTalhoes._avg.temperatura
          ? Number(mediasTalhoes._avg.temperatura.toFixed(2))
          : 0
      },
      filaIrrigacao,
      alertasRecentes,
      estoqueBaixo,
      graficos: {
        umidadeHoje: montarGraficoUmidadeHoje(leiturasHoje),
        consumoSemana: montarGraficoConsumoSemana(consumosSemana)
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar resumo do dashboard",
      error: error.message
    });
  }
}

module.exports = {
  obterResumoDashboard
};
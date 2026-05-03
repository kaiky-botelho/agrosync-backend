const prisma = require("../database/prismaClient");
const { verificarAlertaTalhao } = require("./alertaService");
const {
  atualizarStatusIrrigacoesAutomaticamente
} = require("./irrigacaoStatusService");

const vazaoPorTipo = {
  GOTEJAMENTO: 12,
  ASPERSAO: 25,
  MICROASPERSAO: 8
};

function gerarNumeroAleatorio(min, max) {
  return Math.random() * (max - min) + min;
}

function gerarInteiroAleatorio(min, max) {
  return Math.floor(gerarNumeroAleatorio(min, max + 1));
}

function limitarValor(valor, min, max) {
  return Math.min(Math.max(valor, min), max);
}

function normalizarNumero(valor, fallback) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return fallback;
  }

  return numero;
}

function gerarLeituraInicialTalhao({ umidadeSolo, temperatura } = {}) {
  const umidadeBase =
    umidadeSolo !== undefined && umidadeSolo !== null && umidadeSolo !== ""
      ? normalizarNumero(umidadeSolo, gerarInteiroAleatorio(45, 75))
      : gerarInteiroAleatorio(45, 75);

  const temperaturaBase =
    temperatura !== undefined && temperatura !== null && temperatura !== ""
      ? normalizarNumero(temperatura, gerarNumeroAleatorio(22, 34))
      : gerarNumeroAleatorio(22, 34);

  const umidadeFinal = limitarValor(Math.round(umidadeBase), 0, 100);
  const temperaturaFinal = limitarValor(Number(temperaturaBase.toFixed(1)), 10, 50);

  const status =
    umidadeFinal <= 30 || temperaturaFinal >= 38 ? "SECO" : "NORMAL";

  return {
    umidadeSolo: umidadeFinal,
    temperatura: temperaturaFinal,
    status
  };
}

function deveAtualizarTalhao(talhao) {
  const agora = Date.now();
  const ultimaAtualizacao = new Date(talhao.updatedAt).getTime();

  const umMinuto = 60 * 1000;

  return agora - ultimaAtualizacao >= umMinuto;
}

async function registrarLeituraTalhao(talhao) {
  if (
    talhao.umidadeSolo === null ||
    talhao.umidadeSolo === undefined ||
    talhao.temperatura === null ||
    talhao.temperatura === undefined
  ) {
    return;
  }

  const umMinutoAtras = new Date(Date.now() - 60 * 1000);

  const leituraRecente = await prisma.leituraTalhao.findFirst({
    where: {
      talhaoId: talhao.id,
      createdAt: {
        gte: umMinutoAtras
      }
    }
  });

  if (leituraRecente) {
    return;
  }

  await prisma.leituraTalhao.create({
    data: {
      talhaoId: talhao.id,
      umidadeSolo: Number(talhao.umidadeSolo),
      temperatura: Number(talhao.temperatura),
      statusTalhao: talhao.status
    }
  });
}

async function registrarConsumoIrrigacoesAtivas() {
  const irrigacoesAtivas = await prisma.irrigacao.findMany({
    where: {
      status: "ATIVO"
    },
    include: {
      talhao: true
    }
  });

  const umMinutoAtras = new Date(Date.now() - 60 * 1000);

  for (const irrigacao of irrigacoesAtivas) {
    const consumoRecente = await prisma.consumoAgua.findFirst({
      where: {
        irrigacaoId: irrigacao.id,
        createdAt: {
          gte: umMinutoAtras
        }
      }
    });

    if (consumoRecente) {
      continue;
    }

    const vazao = vazaoPorTipo[irrigacao.tipoIrrigacao] || 10;

    await prisma.consumoAgua.create({
      data: {
        talhaoId: irrigacao.talhaoId,
        irrigacaoId: irrigacao.id,
        tipoIrrigacao: irrigacao.tipoIrrigacao,
        litros: vazao
      }
    });
  }
}

async function atualizarMonitoramentoTalhoesAutomaticamente() {
  await atualizarStatusIrrigacoesAutomaticamente();

  const talhoes = await prisma.talhao.findMany({
    include: {
      irrigacoes: {
        where: {
          status: "ATIVO"
        }
      }
    }
  });

  for (const talhao of talhoes) {
    if (talhao.status === "INATIVO") {
      continue;
    }

    if (!deveAtualizarTalhao(talhao)) {
      await registrarLeituraTalhao(talhao);
      continue;
    }

    const possuiIrrigacaoAtiva = talhao.irrigacoes.length > 0;

    let umidadeSolo =
      talhao.umidadeSolo !== null && talhao.umidadeSolo !== undefined
        ? Number(talhao.umidadeSolo)
        : gerarInteiroAleatorio(45, 75);

    let temperatura =
      talhao.temperatura !== null && talhao.temperatura !== undefined
        ? Number(talhao.temperatura)
        : gerarNumeroAleatorio(22, 32);

    let status = "NORMAL";

    if (possuiIrrigacaoAtiva) {
      umidadeSolo += gerarInteiroAleatorio(2, 6);
      temperatura -= gerarNumeroAleatorio(0.2, 1.2);
      status = "IRRIGANDO";
    } else {
      umidadeSolo -= gerarInteiroAleatorio(1, 3);
      temperatura += gerarNumeroAleatorio(-0.3, 0.8);

      if (umidadeSolo <= 30 || temperatura >= 38) {
        status = "SECO";
      } else {
        status = "NORMAL";
      }
    }

    umidadeSolo = limitarValor(Math.round(umidadeSolo), 0, 100);
    temperatura = limitarValor(Number(temperatura.toFixed(1)), 10, 50);

    const talhaoAtualizado = await prisma.talhao.update({
      where: {
        id: talhao.id
      },
      data: {
        umidadeSolo,
        temperatura,
        status
      }
    });

    await registrarLeituraTalhao(talhaoAtualizado);
    await verificarAlertaTalhao(talhaoAtualizado);
  }

  await registrarConsumoIrrigacoesAtivas();
}

module.exports = {
  gerarLeituraInicialTalhao,
  registrarLeituraTalhao,
  atualizarMonitoramentoTalhoesAutomaticamente
};
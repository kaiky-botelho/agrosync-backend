const prisma = require("../database/prismaClient");

const diasMap = {
  DOM: 0,
  DOMINGO: 0,
  SEG: 1,
  SEGUNDA: 1,
  TER: 2,
  TERCA: 2,
  TERÇA: 2,
  QUA: 3,
  QUARTA: 3,
  QUI: 4,
  QUINTA: 4,
  SEX: 5,
  SEXTA: 5,
  SAB: 6,
  SÁB: 6,
  SABADO: 6,
  SÁBADO: 6
};

const statusManuais = ["PAUSADO", "INATIVO", "CONCLUIDO"];

function calcularStatusAutomatico(irrigacao) {
  if (!irrigacao?.horaInicio || !irrigacao?.duracaoMinutos) {
    return irrigacao.status || "AGENDADO";
  }

  if (statusManuais.includes(irrigacao.status)) {
    return irrigacao.status;
  }

  const agora = new Date();
  const diaAtual = agora.getDay();

  const diasSemana = irrigacao.diasSemana || [];

  const aconteceHoje = diasSemana.some((dia) => {
    return diasMap[dia] === diaAtual;
  });

  if (!aconteceHoje) {
    return "AGENDADO";
  }

  const [hora, minuto] = irrigacao.horaInicio.split(":").map(Number);

  const inicio = new Date();
  inicio.setHours(hora || 0, minuto || 0, 0, 0);

  const fim = new Date(
    inicio.getTime() + Number(irrigacao.duracaoMinutos) * 60000
  );

  if (agora >= inicio && agora <= fim) {
    return "ATIVO";
  }

  if (agora < inicio) {
    return "PROXIMO";
  }

  return "AGENDADO";
}

async function atualizarStatusIrrigacoesAutomaticamente() {
  const irrigacoes = await prisma.irrigacao.findMany();

  for (const irrigacao of irrigacoes) {
    const novoStatus = calcularStatusAutomatico(irrigacao);

    if (novoStatus !== irrigacao.status) {
      await prisma.irrigacao.update({
        where: {
          id: irrigacao.id
        },
        data: {
          status: novoStatus
        }
      });
    }
  }
}

module.exports = {
  calcularStatusAutomatico,
  atualizarStatusIrrigacoesAutomaticamente
};
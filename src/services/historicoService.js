const prisma = require("../database/prismaClient");

async function registrarHistorico({
  usuarioId,
  acao,
  entidade,
  entidadeId,
  descricao,
  dadosAnteriores,
  dadosNovos
}) {
  await prisma.historico.create({
    data: {
      usuarioId,
      acao,
      entidade,
      entidadeId,
      descricao,
      dadosAnteriores: dadosAnteriores || null,
      dadosNovos: dadosNovos || null
    }
  });
}

module.exports = {
  registrarHistorico
};
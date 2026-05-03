-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "Cultura" AS ENUM ('SOJA', 'CANA', 'MILHO', 'OUTRA');

-- CreateEnum
CREATE TYPE "TipoSolo" AS ENUM ('ARENOSO', 'ARGILOSO', 'MISTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusTalhao" AS ENUM ('NORMAL', 'SECO', 'IRRIGANDO', 'INATIVO');

-- CreateEnum
CREATE TYPE "TipoIrrigacao" AS ENUM ('GOTEJAMENTO', 'ASPERSAO', 'MICROASPERSAO');

-- CreateEnum
CREATE TYPE "StatusIrrigacao" AS ENUM ('ATIVO', 'PROXIMO', 'PENDENTE', 'CONCLUIDO', 'AGENDADO', 'INATIVO', 'PAUSADO');

-- CreateEnum
CREATE TYPE "CategoriaInsumo" AS ENUM ('FERTILIZANTE', 'DEFENSIVO', 'SEMENTE', 'CORRETIVO', 'ADJUVANTE', 'OUTRO');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('KG', 'L', 'SC', 'UN', 'T');

-- CreateEnum
CREATE TYPE "StatusEstoque" AS ENUM ('OK', 'BAIXO');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('ESTOQUE', 'IRRIGACAO', 'TALHAO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "SeveridadeAlerta" AS ENUM ('CRITICO', 'ALERTA', 'INFO', 'OK');

-- CreateEnum
CREATE TYPE "StatusAlerta" AS ENUM ('ABERTO', 'EM_ANALISE', 'SOLUCIONADO');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "matricula" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "setor" TEXT,
    "cargo" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OPERADOR',
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talhao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cultura" "Cultura" NOT NULL,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "tipoSolo" "TipoSolo",
    "status" "StatusTalhao" NOT NULL DEFAULT 'NORMAL',
    "umidadeSolo" INTEGER,
    "temperatura" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Irrigacao" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "tipoIrrigacao" "TipoIrrigacao" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "diasSemana" TEXT[],
    "status" "StatusIrrigacao" NOT NULL DEFAULT 'AGENDADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Irrigacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" TEXT NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "categoria" "CategoriaInsumo" NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL,
    "quantidadeEstoque" DOUBLE PRECISION NOT NULL,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL,
    "status" "StatusEstoque" NOT NULL DEFAULT 'OK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "estoqueId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "severidade" "SeveridadeAlerta" NOT NULL,
    "status" "StatusAlerta" NOT NULL DEFAULT 'ABERTO',
    "talhaoId" TEXT,
    "estoqueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoDesativacao" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "solicitadoPorId" TEXT NOT NULL,
    "respondidoPorId" TEXT,
    "justificativa" TEXT NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "observacaoResposta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "SolicitacaoDesativacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historico" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "descricao" TEXT NOT NULL,
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_matricula_key" ON "Usuario"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Talhao_nome_key" ON "Talhao"("nome");

-- AddForeignKey
ALTER TABLE "Irrigacao" ADD CONSTRAINT "Irrigacao_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoDesativacao" ADD CONSTRAINT "SolicitacaoDesativacao_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoDesativacao" ADD CONSTRAINT "SolicitacaoDesativacao_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoDesativacao" ADD CONSTRAINT "SolicitacaoDesativacao_respondidoPorId_fkey" FOREIGN KEY ("respondidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historico" ADD CONSTRAINT "Historico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

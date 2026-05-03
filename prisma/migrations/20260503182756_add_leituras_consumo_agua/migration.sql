-- CreateTable
CREATE TABLE "LeituraTalhao" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "umidadeSolo" INTEGER NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "statusTalhao" "StatusTalhao" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeituraTalhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumoAgua" (
    "id" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "irrigacaoId" TEXT,
    "tipoIrrigacao" "TipoIrrigacao",
    "litros" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumoAgua_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeituraTalhao" ADD CONSTRAINT "LeituraTalhao_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoAgua" ADD CONSTRAINT "ConsumoAgua_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoAgua" ADD CONSTRAINT "ConsumoAgua_irrigacaoId_fkey" FOREIGN KEY ("irrigacaoId") REFERENCES "Irrigacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

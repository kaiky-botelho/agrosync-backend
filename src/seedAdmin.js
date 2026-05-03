const bcrypt = require("bcryptjs");
const prisma = require("./database/prismaClient");

async function main() {
  const senhaCriptografada = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.upsert({
    where: {
      email: "admin@agrosync.com"
    },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@agrosync.com",
      senha: senhaCriptografada,
      matricula: "0001",
      setor: "Gestão",
      cargo: "Gestor",
      role: "ADMIN",
      status: "ATIVO"
    }
  });

  console.log("Admin criado com sucesso:");
  console.log({
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
    role: admin.role
  });
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
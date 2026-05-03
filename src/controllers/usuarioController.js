const bcrypt = require("bcryptjs");
const prisma = require("../database/prismaClient");

async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        dataNascimento: true,
        setor: true,
        cargo: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar usuários",
      error: error.message
    });
  }
}

async function buscarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        dataNascimento: true,
        setor: true,
        cargo: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar usuário",
      error: error.message
    });
  }
}

async function criarUsuario(req, res) {
  try {
    const {
      nome,
      email,
      senha,
      matricula,
      dataNascimento,
      setor,
      cargo,
      role,
      status
    } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios"
      });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        message: "Já existe um usuário com este e-mail"
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        matricula,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        setor,
        cargo,
        role: role || "OPERADOR",
        status: status || "ATIVO"
      },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        dataNascimento: true,
        setor: true,
        cargo: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      usuario
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar usuário",
      error: error.message
    });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;

    const {
      nome,
      email,
      matricula,
      dataNascimento,
      setor,
      cargo,
      role,
      status
    } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id }
    });

    if (!usuarioExiste) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nome,
        email,
        matricula,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        setor,
        cargo,
        role,
        status
      },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        dataNascimento: true,
        setor: true,
        cargo: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    return res.json({
      message: "Usuário atualizado com sucesso",
      usuario
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar usuário",
      error: error.message
    });
  }
}

async function alterarStatusUsuario(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ATIVO", "INATIVO"].includes(status)) {
      return res.status(400).json({
        message: "Status inválido"
      });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true
      }
    });

    return res.json({
      message: "Status do usuário alterado com sucesso",
      usuario
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao alterar status do usuário",
      error: error.message
    });
  }
}

async function removerUsuario(req, res) {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        status: "INATIVO"
      },
      select: {
        id: true,
        nome: true,
        email: true,
        status: true
      }
    });

    return res.json({
      message: "Usuário inativado com sucesso",
      usuario
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao inativar usuário",
      error: error.message
    });
  }
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  alterarStatusUsuario,
  removerUsuario
};
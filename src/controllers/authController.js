const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../database/prismaClient");

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios"
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        message: "Credenciais inválidas"
      });
    }

    if (usuario.status !== "ATIVO") {
      return res.status(403).json({
        message: "Usuário inativo"
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        message: "Credenciais inválidas"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    return res.json({
      message: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        status: usuario.status
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao realizar login",
      error: error.message
    });
  }
}

async function me(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: req.usuario.id
      },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        setor: true,
        cargo: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar usuário logado",
      error: error.message
    });
  }
}

module.exports = {
  login,
  me
};
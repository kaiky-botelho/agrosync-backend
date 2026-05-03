function adminMiddleware(req, res, next) {
  if (req.usuario.role !== "ADMIN") {
    return res.status(403).json({
      message: "Acesso permitido apenas para administradores"
    });
  }

  return next();
}

module.exports = adminMiddleware;
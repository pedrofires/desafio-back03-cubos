const jwt = require('jsonwebtoken');
const segredo = require('../configuracoes/segredo');

const bancoDeDados = require('../bancoDeDados/pool');

const autorizarToken = async (req, res, next) => {
    const { authorization } = req.headers;

    try {
        if (!authorization || authorization === "Bearer")
            return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado." })
        const token = authorization.replace('Bearer ', '');
        const { id } = await jwt.verify(token, segredo);
        const consultarUsuario = await bancoDeDados.query('select * from usuarios where id = $1', [id]);

        if (!consultarUsuario.rowCount)
            return res.status(404).json({ "mensagem": "O usuário não existe" });

        const dadosUsuario = consultarUsuario.rows[0];
        const jsonUsuario = {
            id: dadosUsuario.id,
            nome: dadosUsuario.nome,
            email: dadosUsuario.email
        }
        req.usuario = jsonUsuario;

    } catch (error) {
        return res.status(500).json({ "mensagem": error.message })
    }

    next();
}

module.exports = {
    autorizarToken
}
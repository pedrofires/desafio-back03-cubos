const bancoDeDados = require('../../bancoDeDados/pool');

const listarCategorias = async (req, res) => {
    const { id } = req.usuario;

    try {
        if (!id)
            return res.status(401).json({ "mensagem": "É necessário possuir um token de autenticação" });

        const query = `select * from categorias order by id`;
        const consultarCategoriasDoUsuario = await bancoDeDados.query(query);

        if (!consultarCategoriasDoUsuario)
            return res.status(404).json({ "mensagem": "Não foi encontrado nenhum produto comprado por este usuário" });

        return res.status(200).json(consultarCategoriasDoUsuario.rows);
    } catch (error) {
        return res.status(500).json({ "mensagem": error.message });
    }
}

module.exports = { listarCategorias };
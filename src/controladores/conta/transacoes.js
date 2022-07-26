const bancoDeDados = require('../../bancoDeDados/pool');

const listarTransacoes = async (req, res) => {
    const { id } = req.usuario;

    try {

        if (!id)
            return res.status(404).json({ "mensagem": "Para acessar este recurso é necessário possuir um token de autenticação" });

        const query = `select * from transacoes where usuario_id = $1 order by transacoes.id`;
        const consultarTransacoes = await bancoDeDados.query(query, [id]);
        if (!consultarTransacoes)
            return res.status(404).json({ "mensagem": "Não foi encontrado nenhuma transação deste usuário" });

        return res.status(200).json(consultarTransacoes.rows);

    } catch (error) {
        return res.status(500).json({ "mensagem": error.message });
    }
}

const detalharTransacao = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;
    try {
        if (!usuario)
            return res.status(404).json({ "mensagem": "Para acessar este recurso é necessário possuir um token de autenticação" });
        if (!id)
            return res.status(404).json({ "mensagem": "Transação não encontrada." });

        const query = `select * from transacoes where usuario_id = $1 and transacoes.id = $2`;
        const consultarTransacao = await bancoDeDados.query(query, [usuario.id, id]);
        if (!consultarTransacao)
            return res.status(404).json({ "mensagem": "Não foi encontrado nenhuma transação deste usuário" });

        return res.status(200).json(consultarTransacao.rows[0]);

    } catch (error) {
        return res.status(500).json({ "mensagem": error.message });
    }
}

const cadastrarTransacao = async (req, res) => {
    const { id } = req.usuario;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!id)
            return res.status(404).json({ "mensagem": "Para acessar este recurso é necessário possuir um token de autenticação" });

        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ "mensagem": "Todos os campos obrigatórios devem ser informados." });
        }
        const query = `insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo)
        values($1,$2,$3,$4,$5,$6)`
        const adicionarTransacao = await bancoDeDados.query(query, [descricao, valor, data, categoria_id, id, tipo]);

        if (!adicionarTransacao)
            return res.status(400).json({ "mensagem": "Não foi possível criar uma nova transacao" });

        const confirmarTransacao = await bancoDeDados.query(`select * from transacoes where data = $1 and usuario_id = $2 and tipo = $3`, [data, id, tipo]);

        return res.status(201).json(confirmarTransacao.rows[0]);

    } catch (error) {
        return res.status(500).json({ "mensagem": error.message });
    }
}

const atualizarTransacao = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!usuario || !id)
            return res.status(404).json({ "mensagem": "Não foi possível encontrar o usuário ou transação" });

        if (!descricao || !valor || !data || !categoria_id || !tipo)
            return res.status(400).json({ "mensagem": "Todos os campos obrigatórios devem ser informados." });

        if (tipo !== 'entrada' && tipo !== 'saida')
            return res.status(400).json({ "mensagem": "Tipo da transação não foi informado corretamente" });

        const transacaoQuery = `select * from transacoes where transacoes.id = $1 and usuario_id = $2`;
        const consultarTransacao = await bancoDeDados.query(transacaoQuery, [id, usuario.id]);

        if (!consultarTransacao.rowCount)
            return res.status(404).json({ "mensagem": "Não foi possível encontrar esta transação" });

        const categoriaQuery = `select * from categorias where id = $1`;
        const consultarCategoria = await bancoDeDados.query(categoriaQuery, [id]);

        if (!consultarCategoria.rowCount)
            return res.status(404).json({ "mensagem": "Não foi possível encontrar esta categoria de transação" });

        const atualizarQuery = `
            update transacoes set 
            descricao = $1, 
            valor = $2, 
            data = $3, 
            categoria_id = $4, 
            tipo = $5
            where transacoes.id = $6`;
        const realizarAtualizacao = await bancoDeDados.query(atualizarQuery, [descricao, valor, data, categoria_id, tipo, id]);

        if (!realizarAtualizacao.rowCount)
            return res.status(500).json({ "mensagem": "Não foi possível atualizar a transação" });

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ "mensagem": error.message })
    }
}

const excluirTransacao = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;
    try {
        if (!usuario || !id)
            return res.status(404).json({ "mensagem": "Não foi possível encontrar o usuário ou transação" });

        const transacaoQuery = `select * from transacoes where transacoes.id = $1 and usuario_id = $2`;
        const consultarTransacao = await bancoDeDados.query(transacaoQuery, [id, usuario.id]);

        if (!consultarTransacao.rowCount)
            return res.status(404).json({ "mensagem": "Não foi possível encontrar esta transação" });

        const excluirQuery = `delete from transacoes where transacoes.id = $1 and usuario_id = $2`;
        const realizarExclusao = await bancoDeDados.query(excluirQuery, [id, usuario.id]);

        if (!realizarExclusao.rowCount)
            return res.status(500).json({ "mensagem": "Não foi possível excluir esta transação" });

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ "mensagem": error.message })
    }
}

const obterExtratoTransacao = async (req, res) => {
    const usuario = req.usuario;

    try {
        if (!usuario)
            return res.status(404).json({ "mensagem": "Não foi possível encontrar o usuário" });

        const saidaQuery = `select sum(valor) as saida from transacoes where tipo = 'saida' and usuario_id = $1;`;
        const entradaQuery = `select sum(valor) as entrada from transacoes where tipo = 'entrada' and usuario_id = $1;`;
        let consultarSaida = await bancoDeDados.query(saidaQuery, [usuario.id]);
        let consultarEntrada = await bancoDeDados.query(entradaQuery, [usuario.id]);

        const resposta = {
            entrada: consultarEntrada.rows[0].entrada ? consultarEntrada.rows[0].entrada : 0,
            saida: consultarSaida.rows[0].saida ? consultarSaida.rows[0].saida : 0
        };

        return res.status(200).json(resposta);
    } catch (error) {
        return res.status(500).json({ "mensagem": error.message })
    }

}
module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    excluirTransacao,
    obterExtratoTransacao
}
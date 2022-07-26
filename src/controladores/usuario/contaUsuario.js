const bancoDeDados = require('../../bancoDeDados/pool');

const jwt = require('jsonwebtoken');
const segredo = require('../../configuracoes/segredo');

const securePassword = require('secure-password');
const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha)
            return res.status(400).json({ "mensagem": "Preencha os campos!" });


        const emailExiste = await bancoDeDados.query('select * from usuarios where email = $1', [email]);
        if (emailExiste.rowCount)
            return res.status(400).json({ "mensagem": "Já existe usuário cadastrado com o e-mail informado." });


        const senhaEncriptada = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const consulta = `insert into usuarios(nome, email, senha) values ($1,$2,$3)`;
        const usuario = await bancoDeDados.query(consulta, [nome, email, senhaEncriptada]);

        if (!usuario.rowCount)
            return res.status(400).json({ "mensagem": "Não foi possível cadastrar o usuário" });


        const encontrarUsuario = await bancoDeDados.query('select * from usuarios where email = $1', [email]);
        const jsonUsuario = {
            id: encontrarUsuario.rows[0].id,
            nome: encontrarUsuario.rows[0].nome,
            email: encontrarUsuario.rows[0].email
        }

        return res.status(201).json(jsonUsuario);

    } catch (error) {
        return res.status(500).json({ "mensagem": error.message });
    }
}

const logarUsuario = async (req, res) => {
    const { email, senha } = req.body;

    try {

        if (!email || !senha)
            return res.status(400).json({ "mensagem": "Preencha os campos!" });

        const consultarEmail = await bancoDeDados.query('select * from usuarios where email = $1', [email]);
        if (!consultarEmail.rowCount)
            return res.status(400).json({ "mensagem": "Usuário e/ou senha inválido(s)." });

        const usuario = consultarEmail.rows[0];
        const senhaDescriptografada = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"));

        switch (senhaDescriptografada) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json({ "mensagem": "Usuário e/ou senha inválido(s)." });
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
                    const query = `update usuarios set senha = $1 where email = $2`;
                    await bancoDeDados.query(query, [hash, email]);
                } catch (err) {
                }
                break;
        }

        const jsonUsuario =
        {
            id: usuario.id,
            email: usuario.email,
            usuario: usuario.nome
        }
        const token = jwt.sign({
            id: usuario.id
        }, segredo, {
            expiresIn: '2h'
        });

        return res.status(200).send({ usuario: jsonUsuario, token });

    } catch (error) {
        return res.status(500).json({ "mensagem": error.message })
    }
}

const detalharUsuario = async (req, res) => {
    if (!req.usuario)
        return res.status(404).json({ "mensagem": "O usuário não foi encontrado" });

    return res.status(200).json(req.usuario);
}

const atualizarUsuario = async (req, res) => {
    const { id } = req.usuario;

    const { email, nome, senha } = req.body;

    try {
        if (!id)
            return res.status(404).json({ "mensagem": "O usuário não foi encontrado" });

        if (!email || !nome || !senha)
            return res.status(404).json({ "mensagem": "Preencha os campos necessários" });

        const consultarEmail = await bancoDeDados.query('select * from usuarios where email = $1', [email]);
        if (consultarEmail.rowCount)
            return res.status(400).json({ "mensagem": "O e-mail informado já está sendo utilizado por outro usuário." });

        const senhaEncriptada = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const consulta = `update usuarios set nome = $1, email = $2, senha = $3 where id = $4`;
        const usuario = await bancoDeDados.query(consulta, [nome, email, senhaEncriptada, id]);

        if (!usuario.rowCount)
            return res.status(400).json({ "mensagem": "Não foi possível cadastrar o usuário" });

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ "mensagem": error.message });
    }
}

module.exports = {
    cadastrarUsuario,
    logarUsuario,
    detalharUsuario,
    atualizarUsuario
}
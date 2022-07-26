const express = require('express');
const rotas = express();

const contaUsuario = require('./controladores/usuario/contaUsuario');

const transacoes = require('./controladores/conta/transacoes');
const categorias = require('./controladores/categorias/categorias');

const { autorizarToken } = require('./intermediarios/autorizar');

rotas.post('/usuario', contaUsuario.cadastrarUsuario);
rotas.post('/login', contaUsuario.logarUsuario);

rotas.use(autorizarToken);

rotas.get('/usuario', contaUsuario.detalharUsuario);
rotas.put('/usuario', contaUsuario.atualizarUsuario);
rotas.get('/categorias', categorias.listarCategorias);

rotas.get('/transacao', transacoes.listarTransacoes);
rotas.get('/transacao/extrato', transacoes.obterExtratoTransacao);
rotas.get('/transacao/:id', transacoes.detalharTransacao);
rotas.post('/transacao', transacoes.cadastrarTransacao);
rotas.put('/transacao/:id', transacoes.atualizarTransacao);
rotas.delete('/transacao/:id', transacoes.excluirTransacao);

module.exports = rotas;
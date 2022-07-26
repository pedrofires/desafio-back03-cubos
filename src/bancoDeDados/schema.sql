create database dindin;

create table if not exists usuarios(
  id serial not null primary key,
  nome varchar(50) not null,
  email varchar(50) unique not null,
  senha text not null
);

create table if not exists categorias(
  id serial not null primary key,
  descricao text not null
);

create table if not exists transacoes(
  id serial not null primary key,
  descricao text not null,
  valor int not null,
  data date not null,
  categoria_id int not null references categorias(id),
  usuario_id int not null references usuarios(id),
  tipo text not null
);

insert into categorias(descricao) values
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');
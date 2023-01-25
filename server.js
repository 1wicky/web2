const express = require("express");
const app = express();
const port = 8081;
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const Produto = require("./models/Produto");
const Usuario = require("./models/Usuario");
const conexao = require("./models/conexao");
//conexao.sequelize.sync()



//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//autenticação
const dotenv = require("dotenv");  
dotenv.config();
//const router = require("./rotas/usuario");
const router_usuario = require("./rotas/usuario");
app.use("/usuario", router_usuario);
const validaToken= require('./auth')

//config
//template engine

const exphbs = require("express-handlebars");
const path = require("path");
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.static(path.join(__dirname, "/views")));
app.set("views", path.join(__dirname, "/views"));
app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "views/layouts"),
  })
);
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
  })
);
app.set("view engine", "hbs");

//rotas

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/buscaProdutos", function (req, res) {
  res.render("buscaProdutos");
});

//validação de usuario
//app.use("*",validaToken)

app.get("/cadastraProdutos", function (req, res) {
  res.render("cadastraProdutos");
});
app.get("/atualizaProduto", (req, res) => {
 /* Produto.findAll().then(function(produtos){
    res.render('atualizaProduto', {produtos: produtos.map(produtos => produtos.toJSON())})
  }).catch(function (erro) {
      console.log("Houve problema na busca do produto: " + erro);
      res.send("Houve um erro na solicitação. Contate o administrador!");
    });*/
    var id = req.query.id;
	
	Produto.findOne({
		where:{
			id:id
		}
	}).then(function (produto){
		var formulario = "<form action='/upprodutos' method='post'>";
		formulario += 		"Id: <input type='text' name='id' value='"+produto.id+"'<br>";
		formulario += 		"Código: <input type='text' name='codigo' value='"+produto.codigo+"'><br>";
		formulario+= 		"Nome: <input type='text' name='nome' value='"+produto.nome+"'><br>";
		formulario+= 		"Preço: <input type='text' name='preco' value='"+produto.preco+"'><br>";
		formulario+= 		"Tipo de Evento: <input type='text' name='tipoDeEvento' value='"+produto.tipoDeEvento+"'><br><br>";
    formulario+=     "Descrição: <input type='text' name='tipoDeEvento' value='"+produto.descricao+"'> <br> "
		formulario+=		"<button>Atualizar</button>";
		formulario+=	  "</form>";
		res.send(formulario);
		
	}).catch(function (erro){
		console.log("Houve problema na busca do produto: "+erro);
		res.send("Houve um erro na solicitação. Contate o administrador!");
	})
});

app.post("/upprodutos", urlencodedParser, (req, res) => {
  var id = req.body.id;
  var codigo = req.body.codigo;
  var nome = req.body.nome;
  var preco = req.body.preco;
  var tipoEvent = req.body.tipoDeEvento;
  var local = req.body.local;
  var data = req.body.data;
  var descricao = req.body.descricao;

  var produto = {
    codigo: codigo,
    nome: nome,
    preco: preco,
    tipoDeEvento: tipoEvent,
    local: local,
    data: data,
    descricao: descricao,
  };

  console.log(produto);

  Produto.update(produto, {
    where: {
      id: id,
    },
  })
    .then(function () {
      console.log("Produto atualizado com sucesso!");
      res.send("Produto atualizado com sucesso!");
    })
    .catch(function (erro) {
      console.log("Deu algum erro no update: " + erro);
      res.send(
        "Houve algum problema durante a atualização. Contate o administrado!"
      );
    });
});

app.get("/delprodutos", (req, res) => {
  var id = req.query.id;

  Produto.destroy({
    where: { id: id },
  })
    .then(function () {
      console.log("Produto removido com sucesso!");
      res.send("Produto removido com sucesso!");
    })
    .catch(function (erro) {
      console.log("Erro ao remover produto " + erro);
      res.send("Houve um problema ao remover o produto!");
    });
});

app.post("/produtos", urlencodedParser, function (req, res) {
  var codigo = req.body.codigo;
  var nome = req.body.nome;
  var preco = req.body.preco;
  var tipoEvent = req.body.tipoDeEvento;

  var novoProduto = {
    codigo: codigo,
    nome: nome,
    preco: preco,
    tipoDeEvento: tipoEvent,
  };
  Produto.create(novoProduto)
    .then(function () {
      console.log("Produto cadastrado com sucesso!");
      res.send("Produto cadastrado com sucesso!");
      // res.redirect('/')
    })
    .catch(function (erro) {
      console.log("Deu algu erro no cadastro: " + erro);
      res.send(
        "Houve algum problema durante o cadastro. Contate o administrado!"
      );
    });
});

app.get("/produtos", (req, res) => {
 const { Op } = require("sequelize");

  var codigo = req.query.codigo;
  var nome = req.query.nome;
  var preco = req.query.preco;
  var tipoevent = req.query.tipoDeEvento;

  Produto.findAll({
    where: {
      [Op.or]: [
        {
          nome: {
            [Op.substring]: nome,
          },
        },
        {
          tipoDeEvento: {
            [Op.substring]: tipoevent,
          },
        },
        {
          preco: {
            [Op.lte]: preco,
          },
        },
      ],
    },
  }).then(function (produtos) {
    console.log(produtos);
    var tabela = "<h3>Resultado da Busca</h3><br>";

    for (var i = 0; i < produtos.length; i++) {
      tabela += "<b>Nome:</b> " + produtos[i].nome + "<br>";
      tabela += "R$ " + produtos[i].preco + "<br>";
      tabela += "<b>Tipo de Evento:</b> " + produtos[i].tipoDeEvento + "<br>";
      tabela += "<b>Descrição:</b> " + produtos[i].descricao + "<br>";
      tabela +=
        "<a href='/atualizaProduto?id=" + produtos[i].id + "'>Atualizar</a>";
      tabela +=
        "&nbsp;&nbsp;<a href='/delprodutos?id=" +
        produtos[i].id +
        "'>Excluir</a><br><br>";
    }

    res.send(tabela);
  });
});
// usuario 

app.get("/cadastraUsuario", function (req, res) {
  res.render("cadastraUsuario");
});

app.get("/atualizaUsuario", (req, res) => {/*
  var id = req.query.id;
  
	Usuario.findOne({
		where:{
			id:id
		}
	}).then(function (usuarios){
		var formulario = "<form action='/usuarios' method='get'>";
    formulario += 		"Id: <input type='text' name='id' value='"+usuarios.id+"'<br>";
		formulario += 		"nome: <input type='text' name='nome' value='"+usuarios.nome+"'<br>";
		formulario += 		"login: <input type='text' name='login' value='"+usuarios.login+"'><br>";
		formulario+= 		"senha: <input type='text' name='senha' value='"+usuarios.senha+"'><br>";
		formulario+=		"<button>Atualizar</button>";
		formulario+=	  "</form>";
		res.send(formulario);
		
	}).catch(function (erro){
		console.log("Houve problema na busca do produto: "+erro);
		res.send("Houve um erro na solicitação. Contate o administrador!");
	})*/
  Usuario.findAll().then(function(usuarios){
    res.render('atualizaUsuario', {usuarios: usuarios.map(usuarios => usuarios.toJSON())})
  }).catch(function (erro) {
      console.log("Houve problema na busca do Usuario: " + erro);
      res.send("Houve um erro na solicitação. Contate o administrador!");
    });
});

app.get("/buscaUsuarios", function (req, res) {
  res.render("buscaUsuarios");
});


app.get("/delusuarios", (req, res) => {
  var id = req.query.id;

  Usuario.destroy({
    where: { id: id },
  })
    .then(function () {
      console.log("Produto removido com sucesso!");
      res.send("Produto removido com sucesso!");
    })
    .catch(function (erro) {
      console.log("Erro ao remover produto " + erro);
      res.send("Houve um problema ao remover o produto!");
    });
});

 app.post("/usuarios", urlencodedParser, function (req, res) {
  var nome = req.body.nome;
  var login = req.body.login;
  var senha = req.body.senha;

  var novoUsuario = {
    nome: nome,
    login: login,
    senha: senha,
  };
  Usuario.create(novoUsuario)
    .then(function () {
      console.log("Usuario cadastrado com sucesso!");
      res.send("Usuario cadastrado com sucesso!");
      // res.redirect('/')
    })
    .catch(function (erro) {
      console.log("Deu algu erro no cadastro: " + erro);
      res.send(
        "Houve algum problema durante o cadastro. Contate o administrado!"
      );
    });
});

app.get("/usuarios", (req, res) => {
  const { Op } = require("sequelize");
 
   var codigo = req.query.codigo;
   var nome = req.query.nome;
   var login = req.query.login;
   var senha = req.query.senha;
 
   Usuario.findAll({
     where: {
       [Op.or]: [
         {
          login: {
             [Op.substring]: login,
           },
         },
         {
          nome: {
             [Op.substring]: nome,
           },
         },
         {
           senha: {
             [Op.lte]: senha,
           },
         },
       ],
     },
   }).then(function (usuarios) {
     console.log(usuarios);
     var tabela = "<h3>Resultado da Busca</h3><br>";
 
     for (var i = 0; i < usuarios.length; i++) {
       tabela += "<b>Nome:</b> " + usuarios[i].nome + "<br>";
       tabela += "<b>login:</b> " + usuarios[i].login + "<br>";
       tabela += "<b>senha:</b> " + usuarios[i].senha + "<br>";
       tabela +=
         "<a href='/atualizaUsuario?id=" + usuarios[i].id + "'>Atualizar</a>";
       tabela +=
         "&nbsp;&nbsp;<a href='/delusuarios?id=" +
         usuarios[i].id +
         "'>Excluir</a><br><br>";
     }
 
     res.send(tabela);
   });
 });


app.listen(port, () => {
  console.log(`Esta aplicação está escutando a
porta ${port}`);
});

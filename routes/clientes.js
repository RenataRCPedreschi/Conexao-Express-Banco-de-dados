const Cliente = require("../database/cliente.js");
const Endereco = require("../database/endereco");

const { Router } = require("express");

//Criar o grupo de rotas(/clientes)
const router = Router();


//listar clientes
router.get("/clientes", async (req, res) => {
    //SELECT * FROM clientes
    const listaClientes = await Cliente.findAll();
    res.json(listaClientes);
  });
  
  //buscar cliente específico
  router.get("/clientes/:id", async (req, res) => {
    const cliente = await Cliente.findOne({
      where: { id: req.params.id },
      include: [Endereco],
    });
    if (cliente) {
      res.json(cliente);
    } else {
      res.status(404).json({ message: "Usuário não encontrado." });
    }
  });
  
  //adicionar clientes
  router.post("/clientes", async (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    //Passo para adicionar:
    //Chamar Model.create
    try {
      //Dentro de 'novo' estará o objeto criado
      const novo = await Cliente.create(
        { nome, email, telefone, endereco },
        { include: [Endereco] }
      ); //Permite inserir cliente e endereço num comando
      res.status(201).json(novo); //201 - cliente criado
    } catch (err) {
      res.status(500).json({ message: "Um erro aconteceu" });
    }
  });
  
  // PUT (/clientes) => Atualizar cliente existente
  router.put("/clientes/:id", async (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    const { id } = req.params;
  
    try {
      //findOne busca somente 1 resgitro
      const cliente = await Cliente.findOne({ where: { id } });
      if (cliente) {
        if (endereco) {
          //quando o clienteId de Endereco for = id do cliente fornecido em /clientes/:id
          Endereco.update(endereco, { where: { clienteId: id } });
        }
        //depois de verificar se tem endereço verifica se há atualização nas demais informações
        //quando o clienteId de Cliente for = id do cliente fornecido em /clientes/:id
        await cliente.update({ nome, email, telefone });
        //resposta e qual cliente editado
        res.status(200).json({ message: "Cliente editado!", cliente });
      } else {
        //se não encontrar o cliente
        res.status(404).json({ message: "Usuário não encontrado!" });
      }
    } catch (err) {
      //não consegue consultar o bd por algum motivo
      res.status(500).json({ message: "Aconteceu um erro." });
    }
  });
  
  //deletar cliente
  router.delete("/clientes/:id", async (req, res) => {
    const { id } = req.params;
    const cliente = await Cliente.findOne({ where: { id } });
    try {
      if (cliente) {
        //destroy = deleta cliente
        await cliente.destroy();
        res.status(200).json({ message: "Cliente removido." });
      } else {
        res.status(404).json({ message: "Cliente não encontrado." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Um erro aconteceu." });
    }
  });



module.exports = router;
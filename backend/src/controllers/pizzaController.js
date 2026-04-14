//Aqui en el controlador
//vamos a definir las funciones
//que ejecutarán los métodos get, post, put y delete

//#1- Creo un array de métodos
const pizzasController = {};

//Importo el Schema que voy a utilizar
import pizzasModel from "../models/pizzas.js";

//SELECT
pizzasController.getPizzas = async (req, res) => {
  const pizzas = await pizzasModel.find();
  res.json(pizzas);
};

//INSERT
pizzasController.insertPizza = async (req, res) => {
  //#1- Solicitar los datos que se van a guardar
  const { name, description, price, stock } = req.body;
  //#2- Guardo en el model
  const newPizza = new pizzasModel({ name, description, price, stock });
  //#3- Guardar todo en la base
  await newPizza.save();

  res.json({ message: "pizza saved" });
};

//ELIMINAR
pizzasController.deletePizzas = async (req, res) => {
  await pizzasModel.findByIdAndDelete(req.params.id);
  res.json({ message: "pizzas deleted" });
};

//UPDATE
pizzasController.updatePizzas = async (req, res) => {
  //#1- pido los nuevos valores
  const { name, description, price, stock } = req.body;
  //#2- Actualizo los datos

  await pizzasModel.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      price,
      stock,
    },
    { new: true },
  );

  res.json({ message: "pizza updated" });
};

export default pizzasController;



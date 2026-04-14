import express from "express";
import pizzasController from "../controllers/pizzaController.js";

//Router() nos ayuda a colocar los métodos
//que tendrá el endoint
const router = express.Router()

router.route("/")
.get(pizzasController.getPizzas)
.post(pizzasController.insertPizza)

router.route("/:id")
.put(pizzasController.updatePizzas)
.delete(pizzasController.deletePizzas)


export default router

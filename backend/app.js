import express from "express";
import pizzaRoutes from "./src/routes/pizza.js";
import branchesRoutes from "./src/routes/branches.js";
import employeesRoutes from "./src/routes/employees.js";
import customerRoutes from "./src/routes/customer.js";
import registerCustomer from "./src/routes/registerCustomer.js"
import registerEmployees from "./src/routes/registerEmployees.js"
import adminRoutes from "./src/routes/admin.js";
import cookieParser from "cookie-parser";

//Creo una constante que es igual a
//la libreria Express
const app = express();

app.use(cookieParser());

//Para que la API acepte json
app.use(express.json());

app.use("/api/pizzas", pizzaRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/employee", employeesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/registerCustomer", registerCustomer)
app.use("/api/registerEmployees", registerEmployees);
app.use("/api/Admin", adminRoutes);

export default app;

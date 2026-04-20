import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
 
import { config } from "../../config.js";
import customerModel from "../models/customers.js";
 
const loginCustomerController =  {}
 
loginCustomerController.login = async (req, res) => {
    try {
        const { email, password } = req.body;      
 
        const customerFound = await customerModel.findOne({ email });
        if (!customerFound) {
            return res.status(404).json({ message: "Customer not found" });
        }
 
        //verificar que la cuenta no este bloqueada
        if (customerFound.timeOut && customerFound.timeOut > Date.now()) {
            return res.status(403).json({ message: "Account is blocked" });
        }
 
 
        const isMatch = await bcrypt.compare(password, customerFound.password);
        if (!isMatch) {
            // Si la contraseña es incorrecta, incrementamos el contador de intentos fallidos
            customerFound.loginAttempts = (customerFound.failedLoginAttempts || 0) + 1;
                await customerFound.save();                                                                                                                                                                                                
            if (customerFound.loginAttempts >= 5) {
                customerFound.timeOut = Date.now() + 5 * 60 * 1000; // Bloqueo por 15 minutos
            }
 
            await customerFound.save();
 
            return res.status(403).json({ message: "Account is wrong password" });
        }
 
        customerFound.loginAttempts = 0; // Reiniciar el contador de intentos fallidos
        customerFound.timeOut = null;
 
 
            const token = jsonwebtoken.sign({ id: customerFound._id ,userType:"customer"},
                   
            config.JWT.secret,
 
            { expiresIn: "30d"}
        )
 
        //el token lo guardamos en una cookie
        res.cookie("authCookie", token,)
 
           return res.status(200).json({ message: "Login successful", token });
       
        } catch (error) {
            console.log(error+"error en el login");
        return res.status(500).json({ message: "Internal server error" });
    }
};
 
export default loginCustomerController;
 
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import HTMLRecoveryMail from '../utils/SendRecoveryMail.js'
 
import {config} from '../../config.js'
import customermModel from '../models/customers.js'
 
const recoveryPassword = {};
 
recoveryPassword.requestCode = async(req,res) =>{
    try {
        const {email} = req.body;
       
        //Validar que el correo si exista en la base
        const userFound = await customermModel.findOne({email});
        if(!userFound){
            return res.status(400).json({message: 'User not found'});
        }
 
        const randomCode=  crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            {email, randomCode, userType: "customer", verified: false},
            config.JWT.secret,
            {
                expiresIn: "15m"
            }
        )
 
        res.cookie("recoveryCookie", token, {maxAge: 15*60*1000});
 
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.email.user_email,
                pass: config.email.user_password
            }
        });
 
        const mailOptions = {
            from:  config.email.user_email,
            to: email,
            subject: 'Código de recuperación',
            body: "El código vence en 15 min",
            html: HTMLRecoveryMail(randomCode)
        }
       
         transporter.sendMail(mailOptions, (error, info) =>{
            if(error){
                console.error(error);
                return res.status(500).json({message: 'Error sending email'});
            }
        });
       
        res.status(200).json({message: 'Code sent successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
}
 
recoveryPassword.verifyCode = async(req,res) => {
    try {
        const {code} = req.body;
       
        const token = req.cookies.recoveryCookie;
        const decoded= jsonwebtoken.verify(token, config.JWT.secret);

        //Ahora, comparar el código que el usuario escribio
        //con el esta guardando el token
        if(code !== decoded.randomCode){
            return res.status(400).json({message: "Invalid code"})
        }

        //En cambio, si escribe bien el codigo vamos a colocar en el token que ya esta
        const newToken = jsonwebtoken.sign(
            //#1- ¿Qué vamos a guardar?
            {email: decoded.email, userType: "customer", verified:true},
            //#2.Secret Key
            config.JWT.secret,
            //#3- ¿Cuando expira?
            { expiresIn: "15m"}, 
        );

        res.cookie("recoveryCookie", newToken, { maxAge: 15 *60 * 1000 })

        return res.status(200).json({ message: "Code verified successfully"})
 
    } catch (error) {
        console.log("error"+error)
        return res.status(500).json({message: "Internal server error"})
    }
};
 

recoveryPassword.newPassword = async (req, res) => {
    try {
        const {newPassword, confirmNewPassword} = req.body;

        //Comparo las dos contraseñas
        if(newPassword !== confirmNewPassword){
            return res.status(400).json({message: "Password doesnt match"})
        }

        //vamos a comprobar que la contante verified que esta en el token ya que este en true (O sea que haya pasado el paso 2)
        const token = req.cookies.recoveryCookie
        const decoded = jsonwebtoken.verify(token, config.JWT.secret)

        if(!decoded.verified){
            return res.status(400).json({message: "Code not verified"})
        }

        ////////
        //Encriptar la contraseña
        const passwordHash = await bcrypt.hash(newPassword, 10)

        //Actualizar la contraseña en la base de datos
        await customermModel.findByIdAndUpdate(
            {email: decoded.email},
            {password: passwordHash},
            {new: true}
        )

        res.clearCookie("recoveryCookie")

        return res.status(200).json({message: "Password updated"})

    } catch (error) {
        console.log("error"+error)
        return res.status(500).json({message: "Internal Server Error"})        
    }
}
 
 export default recoveryPassword;
 
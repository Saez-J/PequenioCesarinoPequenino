import nodemailer from "nodemailer"; //Enviar correos
import crypto from "crypto"; //Generar código aleatorio
import jsonwebtoken from "jsonwebtoken"; //Token
import bcryptjs from "bcryptjs"; //Encriptar contraseña
import { config } from "../../config.js";
import adminModel from "../models/admin.js";

//Creo un array de funciones
const adminController = {};

//SELECT
adminController.getAdmins= async (req, res) => {
  try {
    const admin = await adminModel.find();
    return res.status(200).json(admin);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


adminController.register = async (req, res) => {
  try {
    //#1- Solicitar los datos a guardar
    const {
      name,
      lastName,
      birthdate,
      email,
      password,
      isVerified,
      loginAttemps,
      timeOut,
    } = req.body;

    //#2- Validar si el correo existe en la base de datos
    const existsAdmin = await adminModel.findOne({ email });
    if (existsAdmin) {
      return res.status(400).json({ message: "Customer already exists " });
    }

    //Encriptar la contraseña
    const passwordHashed = await bcryptjs.hash(password, 10);

    //Generar un código aleatorio
    const randomCode = crypto.randomBytes(3).toString("hex");

    //Guardamos todo en un token
    const token = jsonwebtoken.sign(
      //#1-¿Qué vamos a guardar?
      {
        randomCode,
        name,
        lastName,
        birthdate,
        email,
        password: passwordHashed,
        isVerified,
        loginAttemps,
        timeOut,
      },
      //#2- Secret key
      config.JWT.secret,
      //#3- ¿Cúando expira?
      { expiresIn: "15m" },
    );

    //guardamos el token en una cookie
    res.cookie("registrationCookie", token, { maxAge: 15 * 60 * 1000 });

    //ENVIAR CORREO ELECTÓNICO
    //#1- Transporter -> ¿Quién lo envía?
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    //#2- mailOptions -> ¿Quíen lo recibe y cómo?
    const mailOptions = {
      from: config.email.user_email,
      to: email,
      subject: "Verificación de cuenta",
      text:
        "Para verificar tu cuenta, utiliza este código " +
        randomCode +
        " expira en 15 minutos",
    };

    //#3- Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error");
        return res.status(500).json({ message: "Error sending email" });
      }

      return res.status(200).json({ message: "Email sent" });
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server eror" });
  }
};

//VERIFICAR EL CÓDIGO QUE ACABAMOS DE ENVIAR
adminController.verifyCode = async (req, res) => {
  try {
    //Solicitamos el código que el usuario escribió en el frontend
    const { verificationCodeRequest } = req.body;

    //Obtener el token de las cookies
    const token = req.cookies.registrationCookie;

    //Extraer todos los datos del token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const {
      randomCode: storedCode,
      name,
      lastName,
      birthdate,
      email,
      password,
      isVerified,
      loginAttemps,
      timeOut,
    } = decoded;

    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    //Si todo está bien, y el usuario, lo registramos en la DB
    const newAdmin = adminModel({
      name,
      lastName,
      birthdate,
      email,
      password,
      isVerified: true,
    });

    await newAdmin.save();

    res.clearCookie("registrationCookie");

    return res.status(200).json({ message: "Customer registered" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//UPDATE
adminController.updateAdmin = async (req, res) => {
  try {
    //#1- Solicitar los nuevos datos
    let { name, lastName, email, password, isVerified } = req.body;
    //VALIDACIONES
    //Sanitizar
    name = name?.trim();
    email = email?.trim();

    //validar campos required
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fields required" });
    }

    //Logintud de carácteres
    if (name.length < 3 || name.length > 15) {
      return res.status(400).json({ message: "Please insert a valid name" });
    }

    //Actualizamos en la base de datos
    const adminUpdate = await adminModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        lastName,
        birthdate,
        email,
        password,
        isVerified,
      },
      { new: true },
    );

    if (!adminUpdate) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer updated" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ELIMINAR
adminController.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = adminModel.findByIdAndDelete(req.params.id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default adminController;

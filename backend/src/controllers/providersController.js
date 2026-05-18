import providerModel from "../models/providers.js";
import { v2 as cloudinary } from "cloudinary";
const providerController = {};

providerController.getAllProviders = async (req, res) => {
    try {
        const providers = await providerModel.find()
        return res.status(200).json(providers)
    } catch (error) {
        console.log("error" + error)
        return res.status(500).json({message: "Internal Server Error"})
    }
}

providerController.insertProvider = async (req, res) => {
    try {
        const {name, phone} = req.body;
        
        const newProvider = new providerModel({
            name,
            phone,
            image: req.file.path,
            public_id: req.file.filename,
        });

        await newProvider.save();

        return res.status(200).json({message: "Provider saved successfully"})
    } catch (error) {
        console.log("error " + error)
        return res.status(500).json({message: "Internal Server Error"});
    }
}

providerController.updateProvider = async (req, res) => {
    try {
        //#1-Solicito los nuevos datos
        const { name, phone } = req.body;

        //Identifico a quien estoy actualizando
        const providerFound = await providerModel.findById(req.params.id)

        const updatedData = {
            name,
            phone
        }

        //Si viene alguna imagen
        if (req.file){
            //Eliminamos la imagen antigua
            await cloudinary.uploader.destroy(providerFound.public_id)

            updatedData.image = req.file.path
            uupdatedData.public_id = req.file.filename

            //actualizamos los valores en la base de datos
            await providerModel.findByIdAndUpdate(
                req.param.id,
                updatedData,
                {new: true}
            )

            return res.status(200).json({message: "Provider updated successfully"})
        }
    } catch (error) {
        console.log("error " + error)
        return res.status(500).json({message: "Internal Server Error"})
    }
};


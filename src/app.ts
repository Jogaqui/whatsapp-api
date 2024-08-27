import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';

const app = express();
app.use(cors());
app.use(express.json()); // Para poder manejar JSON en las solicitudes

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const provider = createProvider(BaileysProvider);

    // Maneja la ruta para enviar mensajes
    app.post('/send-message', handleCtx(async (bot, req, res) => {
        try {
            const { phone, message, mediaUrl } = req.body;

            await bot.sendMessage(phone, message, {
                media: mediaUrl
            });
            res.send('Mensaje enviado correctamente!!!');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.status(500).send('Mensaje no enviado!!!');
        }
    }));

    const httpsOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

    // Inicia el servidor HTTPS
    https.createServer(httpsOptions, app).listen(8443, () => {
        console.log('Servidor HTTPS escuchando en el puerto 8443');
    });

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider
    });
};

main().catch(error => {
    console.error('Error en la aplicación:', error);
});

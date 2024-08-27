import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors";
import https from 'https';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const app = express();
    
    app.use(express.json());
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    const httpsOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

    const httpsServer = https.createServer(httpsOptions, app);

    const provider = createProvider(BaileysProvider);

    // Obtén la ruta del directorio actual usando 'import.meta.url'
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Ruta para el archivo bot.qr.png que está en la carpeta anterior
    app.get('/get-bot-qr', (req, res) => {
        const filePath = path.resolve(__dirname, '..', 'bot.qr.png'); // Ajusta la ruta para ir un nivel arriba
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
                res.status(500).send('Error al enviar el archivo');
            }
        });
    });

    let providerInstance;

    // En la función main, después de crear el proveedor:
    providerInstance = provider;

    // En la ruta de envío de mensajes:
    app.post('/send-message', async (req, res) => {
        try {
            console.log('Cuerpo de la solicitud:', req.body);
            const { phone, message, mediaUrl } = req.body;
            
            if (!phone || !message) {
                return res.status(400).send('Se requieren phone y message');
            }

            if (!providerInstance) {
                return res.status(500).send('Proveedor no inicializado');
            }

            await providerInstance.sendMessage(phone, message, {
                media: mediaUrl
            });
            res.send('Mensaje enviado correctamente!!!');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.status(500).send('Mensaje no enviado!!!');
        }
    });

    httpsServer.listen(8443, () => {
        console.log('Servidor HTTPS escuchando en el puerto 8443');
    });

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider
    });
};

main().catch(error => {
    console.error('Error en la aplicación:', error);
});

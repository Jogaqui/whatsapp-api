import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors";
import https from 'https';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url'; // Importa 'fileURLToPath'
import path from 'path'; // Importa 'path'

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const app = express();
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

    app.post('/send-message', handleCtx(async (bot, req, res) => {
        try {
            const body = req.body;
            const phone = body.phone;
            const message = body.message;
            const mediaUrl = body.mediaUrl;
            console.log(body);
            
            await bot.sendMessage(phone, message, {
                media: mediaUrl
            });
            res.end('Mensaje enviado correctamente!!!')
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.end('Mensaje no enviado!!!')
        }
    }));

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
    console.error('Error en la aplicación:', error);
});

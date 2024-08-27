import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import { fileURLToPath } from 'url'; // Importa 'fileURLToPath'
import path from 'path'; // Importa 'path'

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

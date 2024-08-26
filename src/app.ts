import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors";
import https from 'https';
import fs from 'fs';
import polka from 'polka'; // Si usas Polka como servidor HTTP

const flowBienvenida = addKeyword('hola').addAnswer('¡Buenas! Bienvenido');

const main = async () => {
    const provider = createProvider(BaileysProvider);
    
    // Crear un servidor Polka y usar CORS
    const server = polka();
    server.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Añadir ruta para enviar mensajes
    server.post('/send-message', handleCtx(async (bot, req, res) => {
        try {
            const { phone, message, mediaUrl } = req.body;
            console.log(req.body);
            
            await bot.sendMessage(phone, message, {
                media: mediaUrl
            });

            res.end('Mensaje enviado correctamente!!!');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.end('Mensaje no enviado!!!');
        }
    }));

    // Crear y configurar el servidor HTTPS
    const sslOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };
    
    // Pasar el manejador de solicitudes de Polka a https.createServer
    const httpsServer = https.createServer(sslOptions, server.handler);

    httpsServer.listen(3200, () => {
        console.log('Servidor HTTPS ejecutándose en https://localhost:3200');
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

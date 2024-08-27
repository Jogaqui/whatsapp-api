import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors";
import https from "https";
import fs from "fs";

// Certificados SSL/TLS
const options = {
    key: fs.readFileSync('key.pem'), 
    cert: fs.readFileSync('cert.pem'), 
};

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const provider = createProvider(BaileysProvider);

    const server = https.createServer(options, provider.http?.server);

    // Configura CORS para aceptar todas las solicitudes
    provider.http?.server.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    provider.http?.server.post('/send-message', handleCtx(async (bot, req, res) => {
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

    server.listen(3002, () => {
        console.log('Servidor HTTPS funcionando en el puerto 3002');
    });

    await createBot({
        flow: createFlow([]),
        database: new MemoryDB(),
        provider
    });
};

main().catch(error => {
    console.error('Error en la aplicación:', error);
});

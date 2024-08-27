import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors";
import https from "https";
import fs from "fs";

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const provider = createProvider(BaileysProvider);
    
    // Configuración de HTTPS
    const httpsOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

    // Crear servidor HTTPS
    const httpsServer = https.createServer(httpsOptions, provider.httpServer());

    // Configurar CORS
    provider.httpServer().use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    provider.httpServer().post('/send-message', handleCtx(async (bot, req, res) => {
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

    // Iniciar el servidor HTTPS
    httpsServer.listen(8443, () => {
        console.log('Servidor HTTPS escuchando en el puerto 8443');
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

import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors"; // Importa el paquete cors

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const provider = createProvider(BaileysProvider);
    const sslOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };
    const httpsServer = https.createServer(sslOptions, provider.http?.server);

    httpsServer.listen(3200, () => {
        console.log('Servidor HTTPS ejecutándose en https://localhost:3200');
    });
    
     const httpsServer = https.createServer(sslOptions, provider.http?.server);
    // Configura CORS para aceptar todas las solicitudes
    provider.http?.server.use(cors({
        origin: '*', // Permite solicitudes de cualquier origen
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permite los métodos HTTP especificados
        allowedHeaders: ['Content-Type', 'Authorization'], // Permite los encabezados especificados
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

    await createBot({
        flow: createFlow([]),
        database: new MemoryDB(),
        provider
    });
};

main().catch(error => {
    console.error('Error en la aplicación:', error);
});

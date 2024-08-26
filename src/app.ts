import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import cors from "cors"; // Importa el paquete cors

const flowBienvenida = addKeyword('hola').addAnswer('Buenas! Bienvenido');

const main = async () => {
    const provider = createProvider(BaileysProvider);

    provider.initHttpServer(3002);

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
            
            if (!phone || !message) {
                res.status(400).send('Faltan parámetros necesarios.');
                return;
            }

            await bot.sendMessage(phone, message, {
                media: mediaUrl
            });

            res.status(200).send('Mensaje enviado correctamente!');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.status(500).send('Ocurrió un error al enviar el mensaje.');
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

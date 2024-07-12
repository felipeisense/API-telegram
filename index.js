require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
let chatIds = [];

// Guarda el ID de chat cuando un usuario envía un mensaje
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!chatIds.includes(chatId)) {
        chatIds.push(chatId);
        bot.sendMessage(chatId, "¡Te he añadido a la lista de notificaciones!");
    }
});

// Escucha el comando para enviar un GIF
bot.onText(/\/sendgif/, () => {
    const gifUrl = 'https://tenor.com/view/example-gif-20586215';  // Sustituye por una URL válida de un GIF
    chatIds.forEach(chatId => {
        bot.sendAnimation(chatId, gifUrl);
    });
});

// Ruta para enviar un GIF mediante solicitud POST
app.post('/send-message-gif', (req, res) => {
    const { message, gifUrl } = req.body;

    if (chatIds.length === 0) {
        res.status(404).send("No hay chats registrados para enviar el mensaje y GIF.");
        return;
    }

    let messagePromises = [];
    let gifPromises = [];
    
    chatIds.forEach(chatId => {
        // Enviar mensaje
        const messagePromise = bot.sendMessage(chatId, message)
            .then(() => console.log(`Mensaje enviado exitosamente a ${chatId}`))
            .catch(error => console.error(`Error al enviar mensaje a ${chatId}: ${error}`));

        // Enviar GIF
        const gifPromise = bot.sendAnimation(chatId, gifUrl)
            .then(() => console.log(`GIF enviado exitosamente a ${chatId}`))
            .catch(error => console.error(`Error al enviar GIF a ${chatId}: ${error}`));

        messagePromises.push(messagePromise);
        gifPromises.push(gifPromise);
    });

    // Esperar a que todas las promesas de mensaje y GIF se resuelvan
    Promise.all([...messagePromises, ...gifPromises])
        .then(() => res.send("Mensaje y GIF enviados a todos los chats registrados."))
        .catch(() => res.status(500).send("Ocurrió un error al enviar algunos mensajes o GIFs."));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

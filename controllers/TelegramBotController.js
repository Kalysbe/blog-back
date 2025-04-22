import { parseString } from 'xml2js';
import XMLModel from '../models/Xml.js';
import ClientModel from '../models/Client.js';
import { XMLParser } from "fast-xml-parser";

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();


const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // ID канала, например, -1001234567890
const bot = new TelegramBot(TOKEN, { polling: true });
console.log('TOKEN:', CHANNEL_ID);

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    bot.getChat('@adb_solution_news').then(chat => {
        console.log(chat.id);
      });
      

    if (text === '/start') {
        bot.sendMessage(chatId, 'Привет! Я твой бот!');
    } else {
        bot.sendMessage(chatId, `Ты сказал: ${text}`);
    }
});

function sendMessageToUser(chatId, message) {
    bot.sendMessage(chatId, message);
}

export async function sendMessageToChannel({ title, text, url }) {
  const shortText = text?.slice(0, 500)?.trim();
  const message = `📰 *${title}*\n\n${shortText || '_Нет текста_'}\n\n[Читать далее](${url})`;

  try {
    await bot.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('Ошибка при отправке сообщения в канал:', err);
    return false;
  }
}

  

// app.post('/send-message', (req, res) => {
//     const { message } = req.body;
//     if (!message) {
//         return res.status(400).json({ error: 'Message is required' });
//     }
//     sendMessageToChannel(message);
//     res.json({ success: true, message: 'Message sent to channel' });
// });

export const messageToChannel = async (req, res) => {
    try {
      const { message } = req.body; // Получаем сообщение из тела запроса
  
      // Проверка на отсутствие сообщения
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
  
      // Отправка сообщения в канал (предполагается, что sendMessageToChannel — асинхронная функция)
      const result = await sendMessageToChannel(message);
  
      // Если отправка прошла успешно
      if (result) {
        res.status(200).json({ success: true, message: 'Message sent to channel' });
      } else {
        res.status(500).json({ error: 'Failed to send message to channel' });
      }
    } catch (error) {
      // Логирование ошибки и отправка ответа с ошибкой
      console.error("Ошибка обработки запроса:", error);
      res.status(500).json({
        message: "Не удалось обработать запрос.",
        error: error.message,
      });
    }
  };
  






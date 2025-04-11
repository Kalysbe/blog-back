import cron from 'node-cron';
import cronParser from 'cron-parser'; // <-- импорт по умолчанию, т.к. пакет — CommonJS
import { PostController } from './controllers/index.js';

const CRON_EXPRESSION = '0 9,12,15,18 * * *';

// 1. Настраиваем CRON-задачу
cron.schedule(CRON_EXPRESSION, () => {
  PostController.generateChatGptArticle();
  console.log('Задача запущена');
});

// 2. Каждую минуту считаем, сколько осталось до следующего запуска
setInterval(() => {
  try {
    // Вызов cronParser.parseExpression(...)
    const interval = cronParser.parseExpression(CRON_EXPRESSION, {
      currentDate: new Date(),
    });
    const nextRun = interval.next().toDate();

    const diffMs = nextRun - new Date();
    const diffMins = Math.floor(diffMs / 1000 / 60);

    console.log(`До следующего запуска осталось ~${diffMins} минут(ы).`);
  } catch (error) {
    console.error('Ошибка при вычислении следующего запуска:', error);
  }
}, 60 * 1000);

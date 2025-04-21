import TrackerModel from '../models/Tracker.js';

export const create = async (req, res) => {
  try {
    // Получаем IP-адрес из заголовков запроса
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Извлекаем остальные данные из тела запроса
    const { userAgent, deviceType, url, referer, timeSpent } = req.body;

    // Создаем новый документ с полученными данными
    const doc = new TrackerModel({
      ip,
      userAgent,
      deviceType,
      url,
      referer,
      timeSpent,
    });

    // Сохраняем документ в базе данных
    const tracker = await doc.save();
    
    // Отправляем успешный ответ
    res.json(tracker);
  } catch (err) {
    // Логирование ошибки
    console.log('Ошибка при создании:', err);
    
    // Ответ с ошибкой
    res.status(500).json({
      message: 'Не удалось создать',
    });
  }
};

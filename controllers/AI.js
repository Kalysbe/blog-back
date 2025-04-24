import AIModel from '../models/AI.js';

export const getAll = async (req, res) => {
  try {
    const contents = await AIModel.find().populate('name').sort({ createdAt: -1 }).exec();
    res.json(contents);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить трекеры',
    });
  }
};

export const create = async (req, res) => {
  try {
    // Получаем IP-адрес из заголовков запроса
  

    // Извлекаем остальные данные из тела запроса
    const {name } = req.body;

    // Создаем новый документ с полученными данными
    const doc = new AIModel({
     name
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

import axios from 'axios';

import AIModel from '../models/AI.js';
const OPENAI_KEY = process.env.OPENAI_KEY;

export const getAll = async (req, res) => {
  try {
    const settings = await AIModel.find().exec();
    res.json(settings);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить параметры',
    });
  }
};


export const create = async (req, res) => {
  try {
    const {active, systemPromptIdea, userPromptIdea , systemPromptArticle , userPromptArticle , userId } = req.body;

    // Создаем новый документ с полученными данными
    const doc = new AIModel({
      systemPromptIdea,
      userPromptIdea,
      systemPromptArticle,
      userPromptArticle,
      userId
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

export const update = async (req, res) => {
  try {
    const settingId = req.params.id;
    const {
      active,
      systemPromptIdea,
      userPromptIdea,
      systemPromptArticle,
      userPromptArticle
    } = req.body;

    const updatedSetting = await AIModel.findByIdAndUpdate(
      settingId,
      {
        active,
        systemPromptIdea,
        userPromptIdea,
        systemPromptArticle,
        userPromptArticle
      },
      { new: true }
    ).exec();

    if (!updatedSetting) {
      return res.status(404).json({ message: 'Трекер не найден' });
    }

    res.json(updatedSetting);
  } catch (err) {
    console.log('Ошибка при обновлении настроек:', err);
    res.status(500).json({
      message: 'Не удалось обновить настройку',
    });
  }
};







export const getOpenAiInfo = async (req, res) => {
  try {
    const headers = {
      Authorization: `Bearer ${OPENAI_KEY}`
    };

    // 1. Получить баланс
    const creditRes = await axios.get(
      'https://api.openai.com/dashboard/billing/credit_grants',
      { headers }
    );

    // 2. Получить usage за последние 14 дней
    const usageRes = await axios.get(
      `https://api.openai.com/dashboard/billing/usage?start_date=2025-05-01&end_date=2025-05-14`,
      { headers }
    );

    // 3. Получить список моделей (если надо)
    const modelsRes = await axios.get(
      'https://api.openai.com/v1/models',
      { headers }
    );

    return res.status(200).json({
      balance: creditRes.data,
      usage: usageRes.data,
      models: modelsRes.data.data.map((m) => m.id)
    });
  } catch (err) {
    console.error('Ошибка при получении информации об OpenAI:', err.response?.data || err);
    return res.status(500).json({ error: 'Ошибка получения информации об OpenAI' });
  }
};


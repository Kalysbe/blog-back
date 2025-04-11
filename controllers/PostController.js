import PostModel from '../models/Post.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { TelegramBotController } from './index.js'

dotenv.config();

const openai = new OpenAI({
 apiKey: process.env.OPENAI_KEY
});

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').sort({ createdAt: -1 }).exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(','),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export async function generateChatGptArticle() {
  // 1. Получаем названия уже существующих статей
  const existingPosts = await PostModel.find({}, 'title').lean();
  const existingTitles = existingPosts.map((post) => post.title.toLowerCase());

  // 2. Генерируем уникальную тему
  let newTopic = '';
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const ideaResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // или другой необходимый вам модельный идентификатор
      messages: [
        {
          role: 'system',
          content: `Ты — опытный практикующий бухгалтер и аудитор из Кыргызской Республики с многолетним стажем. 
- Никогда не упоминай, что ты ИИ или что твой ответ сгенерирован нейросетью. 
- Пиши так, как будто это твои собственные знания и личный опыт.
- Используй простой и дружелюбный стиль изложения.
- Упоминай местные реалии: законы и правила КР, практику применения 1С и Excel среди бухгалтеров. 
- Если говоришь об искусственном интеллекте, опиши его так, будто это внешний инструмент, полезный для работы бухгалтера, не выдавая, что ты сам ИИ. 
- Приводи реальные или реалистичные примеры, связанные с бухгалтерией и аудитом в Кыргызской Республике.
- Темы должны быть релевантны аудитории бухгалтеров, аудиторов и бизнесменов в КР.`,
        },
        {
          role: 'user',
          content: `Придумай интересную тему статьи для аудиторского или бухгалтерского блога, которая ещё не встречалась среди уже созданных статей.Просто дай мне название темы без обьяснение, без ничего и даже без кавычки`,
        },
      ],
    });

    // Берём текст ответа
    const idea = ideaResp.choices[0].message.content.trim();

    // Проверяем, чтобы идея не совпадала с уже имеющимися статьями
    if (!existingTitles.includes(idea.toLowerCase())) {
      newTopic = idea;
      break;
    }
    attempts++;
  }

  if (!newTopic) {
    // Если уникальную тему не удалось найти
    throw new Error('Не удалось найти уникальную тему для статьи');
  }

  // 3. Генерация полного текста статьи
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // или тот же gpt-4o-mini, который вам нужен
    messages: [
      {
        role: 'system',
        content: `Ты — опытный практикующий бухгалтер и аудитор из КР.
Пиши так, будто ты — человек с многолетним опытом.
Не говори, что ты ИИ. 
Используй живой, понятный язык, добавляй местные примеры (Минфин КР, Налоговая служба, практика использования 1С, Excel).
Добавляй неожиданные и свежие примеры для разнообразия.
Можешь упоминать, как искусственный интеллект помогает бухгалтерам, но без упоминания, что сам ответ создаёт ИИ.
Старайся использовать разные стилистические приёмы: списки, подзаголовки, короткие вставки-цитаты, выделения, чтобы текст выглядел разнообразно.
Иногда используй юмор, если это уместно.
Оформляй статью в Markdown: заголовки, списки, цитаты, выделения, ссылки.`,
      },
      {
        role: 'user',
        content: `Напиши, пожалуйста, развёрнутую статью на тему: "${newTopic}".
- Упоминай реальные (или реалистичные) примеры и кейсы из практики в КР.
- Расскажи о разных бухгалтерских инструментах например 1С или Excel или еще что нибудь, если это уместно.
- Покажи плюсы и минусы, дай советы начинающим специалистам.
- Используй Markdown: заголовки, списки, цитаты, выделения, ссылки.`,
      },
    ],
  });
  const generatedText = response.choices[0].message.content;

  // 4. Сохраняем статью в базе
  const doc = new PostModel({
    title: newTopic,
    text: generatedText,
    imageUrl: '',
    tags: ['бухгалтерия', 'КР', 'технологии'],
    user: '66412dc81fade38117c9012d', // ID пользователя
  });
  const post = await doc.save();

  // URL статьи, если она будет доступна по ID
  const urlToArticle = `https://adb-solution.com/news/${post._id}`;

  // 5. Публикация в Telegram
  await TelegramBotController.sendMessageToChannel({
    title: newTopic,
    text: generatedText,
    url: urlToArticle,
  });

  // Возвращаем нужные данные (ID статьи, тему и пр.)
  return {
    postId: post._id,
    newTopic,
  };
}

export const createChatGpt = async (req, res) => {
  try {
    // 1. Получаем названия уже существующих статей
    const existingPosts = await PostModel.find({}, 'title').lean();
    const existingTitles = existingPosts.map((post) => post.title.toLowerCase());

    // 2. Генерируем новую тему, которой нет в базе
    let newTopic = '';
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const ideaResp = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // или другая нужная модель
        messages: [
          {
            role: 'system',
            content: `Ты — опытный практикующий бухгалтер и аудитор из Кыргызской Республики с многолетним стажем. 
- Никогда не упоминай, что ты ИИ или что твой ответ сгенерирован нейросетью. 
- Пиши так, как будто это твои собственные знания и личный опыт.
- Используй простой и дружелюбный стиль изложения.
- Упоминай местные реалии: законы и правила КР, практику применения 1С и Excel среди бухгалтеров. 
- Если говоришь об искусственном интеллекте, опиши его так, будто это внешний инструмент, полезный для работы бухгалтера, не выдавая, что ты сам ИИ. 
- Приводи реальные или реалистичные примеры, связанные с бухгалтерией и аудитом в Кыргызской Республике.
- Темы должны быть релевантны аудитории бухгалтеров, аудиторов и бизнесменов в КР.`
          },
          {
            role: 'user',
            content: `Придумай интересную тему статьи для аудиторского или бухгалтерского блога, которая ещё не встречалась среди уже созданных статей.Просто дай мне название темы без обьяснение, без ничего и даже без кавычки`
          }
        ]
      });

      const idea = ideaResp.choices[0].message.content.trim();

      // Проверяем, чтобы идея не совпадала с уже существующими названиями
      if (!existingTitles.includes(idea.toLowerCase())) {
        newTopic = idea;
        break;
      }

      attempts++;
    }

    if (!newTopic) {
      console.warn('Не удалось найти уникальную тему для статьи.');
      return res.status(200).json({ message: 'Не удалось найти уникальную тему для статьи.' });
    }

    // 3. Генерация полного текста статьи
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // или нужная вам модель
      messages: [
        {
          role: 'system',
          content: `Ты — опытный практикующий бухгалтер и аудитор из КР.
Пиши так, будто ты — человек с многолетним опытом.
Не говори, что ты ИИ. 
Используй живой, понятный язык, добавляй местные примеры (Минфин КР, Налоговая служба, практика использования 1С, Excel).
Добавляй неожиданные и свежие примеры для разнообразия.
Можешь упоминать, как искусственный интеллект помогает бухгалтерам, но без упоминания, что сам ответ создаёт ИИ.
Старайся использовать разные стилистические приёмы: списки, подзаголовки, короткие вставки-цитаты, выделения, чтобы текст выглядел разнообразно.
Иногда используй юмор, если это уместно.
Оформляй статью в Markdown: заголовки, списки, цитаты, выделения, ссылки.`
        },
        {
          role: 'user',
          content: `Напиши, пожалуйста, развёрнутую статью на тему: "${newTopic}".
- Упоминай реальные (или реалистичные) примеры и кейсы из практики в КР.
- Расскажи о разных бухгалтерских инструментах например 1С или Excel или еще что нибудь, если это уместно.
- Покажи плюсы и минусы, дай советы начинающим специалистам.
- Используй Markdown: заголовки, списки, цитаты, выделения, ссылки.`
        }
      ]
    });

    const generatedText = response.choices[0].message.content;

    // 4. Сохраняем статью в базе
    const doc = new PostModel({
      title: newTopic,
      text: generatedText,
      imageUrl: '',
      tags: ['бухгалтерия', 'КР', 'технологии'], // Меняйте теги, как хотите
      user: '66412dc81fade38117c9012d', // Ваш пользователь
    });

    const post = await doc.save();
    const urlToArticle = `https://adb-solution.com/news/${post._id}`;

    // 5. Публикация в Telegram-канал (или любым другим способом)
    await TelegramBotController.sendMessageToChannel({
      title: newTopic,
      text: generatedText,
      url: urlToArticle,
    });

    console.log(`[✓] Статья "${newTopic}" успешно создана!`);
    return res.status(200).json({
      message: `Статья "${newTopic}" успешно создана!`,
      postId: post._id,
    });
  } catch (err) {
    console.error('[✗] Ошибка при генерации статьи:', err);
    return res.status(500).json({ error: 'Ошибка при генерации статьи' });
  }
};


export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(','),
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

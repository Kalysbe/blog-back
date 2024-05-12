import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      role:req.body.role,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться!',
    });
  }
};

export const update = async (req, res) => {
  console.log(req.params,'user')
  try {
    const userId = req.params.id; // Предполагается, что идентификатор пользователя передается через URL параметры

    // Получаем новые данные из запроса
    const newData = {
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      role: req.body.role,
    };

    // Если есть новый пароль, хешируем его и обновляем хеш
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      newData.passwordHash = hash;
    }

    // Обновляем данные пользователя
    const updatedUser = await UserModel.findByIdAndUpdate(userId, newData, { new: true });

    // Генерируем новый токен
    const token = jwt.sign(
      {
        _id: updatedUser._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    // Исключаем хеш пароля из данных пользователя
    const { passwordHash, ...userData } = updatedUser._doc;

    // Отправляем обновленные данные и токен в ответе
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить данные пользователя!',
    });
  }
};


export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};
export const getAll = async (req, res) => {
  try {
    const users = await UserModel.find({}, '-password').sort({ createdAt: -1 }).exec();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

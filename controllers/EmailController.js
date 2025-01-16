import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { exec } from 'child_process';




// Функция для получения списка пользователей с сервера


export const getAll = async (req, res) => {
  try {

    exec('doveadm user \'*\'' , (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'Error executing doveadm command' });
      }
  
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }
  
      // Разбиваем вывод по строкам и возвращаем как JSON
      const mailUsers = stdout.split('\n').filter(user => user.trim() !== '');
      return res.json(mailUsers);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить пользователей',
    });
  }
};

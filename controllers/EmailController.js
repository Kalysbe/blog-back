import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { exec } from 'child_process';




// Функция для получения списка пользователей с сервера
const getMailAccountsFromServer = () => {
    return new Promise((resolve, reject) => {
      exec('getent passwd', (error, stdout, stderr) => {
        if (error) {
          return reject(`Error fetching user list: ${stderr}`);
        }
  
        // Фильтруем пользователей, например, ищем тех, чьи домашние директории содержат "/var/mail/"
        const accounts = stdout
          .split('\n')
          .filter(line => line.includes('/var/mail/'))
          .map(line => line.split(':')[0]); // Берем только имя пользователя
        console.log(accounts,'accoutnts')
        resolve(accounts);
      });
    });
  };


export const getAll = async (req, res) => {
  try {

    const emailAccountsFromServer = await getMailAccountsFromServer();
    res.json(emailAccountsFromServer);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить пользователей',
    });
  }
};

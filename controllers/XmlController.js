import { parseString } from 'xml2js';
import XMLModel from '../models/Xml.js';

function getQuarter(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // Месяцы начинаются с 0
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

// Парсер JSON данных
function parseReceipts(data) {
  const receipts = data.receipts.receipt || [];
  const result = receipts
    .filter(receipt => receipt.documentstatusname[0] !== 'Отклонен') // Фильтруем по статусу
    .map(receipt => ({
      contractorName: receipt.contractorname[0],
      createdDate: receipt.createddate[0],
      totalCost: parseFloat(receipt.totalcost[0]),
    }));

  return result;
}

// Группировка по году и кварталу
function groupByYearAndQuarter(receipts) {
  const years = {};

  receipts.forEach(receipt => {
    const date = new Date(receipt.createdDate);
    const year = date.getFullYear();
    const quarter = getQuarter(receipt.createdDate);

    if (!years[year]) {
      years[year] = {};
    }
    if (!years[year][quarter]) {
      years[year][quarter] = {
        receipts: [],
        total: 0,
      };
    }

    years[year][quarter].receipts.push(receipt);
    years[year][quarter].total += receipt.totalCost;
  });

  return years;
}


function cleanJson(obj) {
  if (Array.isArray(obj) && obj.length === 1) {
      return cleanJson(obj[0]); // Если массив содержит один элемент, разворачиваем его
  } else if (obj !== null && typeof obj === 'object') {
      for (const key in obj) {
          obj[key] = cleanJson(obj[key]); // Рекурсивно обрабатываем вложенные объекты
      }
  }
  return obj;
}


export const create = async (req, res) => {
  try {
    // Получаем IP-адрес клиента с учётом прокси
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const normalizedIp = clientIp === '::1' ? '127.0.0.1' : clientIp;

    // Время и дата запроса
    const requestTime = new Date().toISOString();

    // Логируем информацию о запросе
    console.log('Request Info:');
    console.log(`IP Address: ${normalizedIp}`);
    console.log(`Request Method: ${req.method}`);
    console.log(`Request URL: ${req.originalUrl}`);
    console.log(`User-Agent: ${req.headers['user-agent']}`);
    console.log(`Request Time: ${requestTime}`);
    console.log(`Headers:`, req.headers);

    // Извлекаем данные и очищаем их от лишних массивов
    let data = req.body;
    data = cleanJson(data);

    // Извлекаем и фильтруем receipts
    const receipts = Array.isArray(data.receipts?.receipt) ? data.receipts.receipt : [data.receipts?.receipt];
    const filteredReceipts = receipts.filter(receipt => receipt.documentStatusName !== 'Отклонен');

    // Формируем данные для сохранения
    const fData = {
      company: "test", // Массив имен компаний
      ip: normalizedIp,
      data: filteredReceipts
    };

    // Создаем документ и сохраняем его в базе
    const doc = new XMLModel(fData);
    await doc.save();

    // Формируем имя файла и сохраняем XML
    const fileName = `client_${Date.now()}.xml`;



    // Возвращаем успешный ответ
    return res.status(200).send({ fileName });
  } catch (error) {
    // Обрабатываем ошибку
    console.error('Ошибка обработки запроса:', error);
    return res.status(500).json({
      message: 'Не удалось обработать запрос.',
      error: error.message,
    });
  }
};

export const converter = async (req, res) => {
   const data = JSON.stringify(req.body, null, 2); 
  try {
    res.status(200).send(data);
  } catch (error) {
    console.error('Ошибка обработки XML:', error);
    res.status(500).json({
      message: 'Не удалось обработать XML.',
      error: error.message,
    });
  }
}
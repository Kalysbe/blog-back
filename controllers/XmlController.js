import { parseString } from 'xml2js';
import XMLModel from '../models/Xml.js';
import xml2js from 'xml2js';

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


function XMLParser(obj) {
  const options = {
    explicitArray: false,  // Убираем создание массива для одиночных элементов
    normalizeTags: true,   // Нормализуем теги
    mergeAttrs: true,      // Сливаем атрибуты в объект
  };

  return new Promise((resolve, reject) => {
    xml2js.parseString(obj, options, (err, result) => {
      if (err) {
        reject('Ошибка при парсинге XML: ' + err);
      } else {
        // Обеспечиваем, чтобы receipts всегда был массивом
        if (!Array.isArray(result.receipts.receipt)) {
          result.receipts.receipt = [result.receipts.receipt];  // Если это не массив, делаем его массивом
        }
        // Преобразуем receipt в объект, если это необходимо
        result.receipts.receipt = result.receipts.receipt.map(receipt => {
          if (typeof receipt === 'object') {
            return receipt;  // Просто возвращаем объект
          }
          return { receipt };  // Если это не объект, оборачиваем в объект
        });

        resolve(result);  // Возвращаем результат
      }
    });
  });
}


export const create = async (req, res) => {
  let data = req.body;  // XML данные, которые были переданы через body

  try {
    // Получаем IP-адрес клиента с учётом прокси
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const normalizedIp = clientIp === '::1' ? '127.0.0.1' : clientIp;

    // Время и дата запроса
    const requestTime = new Date().toISOString();

    // Парсим XML с использованием асинхронной функции
    const parsedData = await XMLParser(data);

    console.log(parsedData);

    // Формируем данные для сохранения
    const fData = {
      company: parsedData.receipts.receipt[0].organizationname,  // Массив имен компаний
      ip: normalizedIp,
      data: parsedData.receipts.receipt  // Данные XML
    };

    // Создаем документ и сохраняем его в базе данных
    const doc = new XMLModel(fData);
    await doc.save();

    // Формируем имя файла для сохранения XML
    const fileName = `client_${Date.now()}.xml`;

    // Возвращаем успешный ответ
    return res.status(200).send(fileName);

  } catch (error) {
    // Обрабатываем ошибку
    console.error('Ошибка обработки запроса:', error);
    return res.status(500).json({
      message: 'Не удалось обработать запрос.',
      error: error.message,
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const xmls = await XMLModel.find()
      .select('_id company ip createdAt')
      .sort({ createdAt: -1 })
      .exec();  
     
    res.json(xmls);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить клиентов',
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
import { parseString } from 'xml2js';
import XMLModel from '../models/Xml.js';
import { XMLParser } from "fast-xml-parser";

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


// function XMLParser(obj) {
//   console.log(obj)
//   // Убираем все пробелы и символы новой строки до первого тега
//   const cleanedXml = obj

//   const options = {
//     explicitArray: false,  // Убираем создание массива для одиночных элементов
//     normalizeTags: true,   // Нормализуем теги
//     mergeAttrs: true,      // Сливаем атрибуты в объект
//   };

//   return new Promise((resolve, reject) => {
//     xml2js.parseString(cleanedXml, options, (err, result) => {
//       if (err) {
//         reject('Ошибка при парсинге XML: ' + err);
//       } else {
//         // Убедимся, что receipts всегда является массивом
//         if (!result.receipts || !Array.isArray(result.receipts.receipt)) {
//           reject('Ошибка: нет или неправильный формат receipts.receipt');
//           return;
//         }

//         // Обрабатываем receipt как объект
//         result.receipts.receipt = result.receipts.receipt.map(receipt => {
//           if (typeof receipt === 'object') {
//             return receipt;  // Просто возвращаем объект
//           }
//           return { receipt };  // Если это не объект, оборачиваем в объект
//         });

//         resolve(result);  // Возвращаем результат
//       }
//     });
//   });
// }

export const create = async (req, res) => {
  try {
    const xmlData = req.body; // Получаем XML данные из тела запроса

    // Настройки для парсера
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "", // Убираем префикс для атрибутов
    });

    // Парсим XML в JSON
    const parsedData = parser.parse(xmlData);

    // Убедимся, что receipts всегда массив
    if (!Array.isArray(parsedData.receipts.receipt)) {
      parsedData.receipts.receipt = [parsedData.receipts.receipt];
    }

    console.log(parsedData);

    // Пример обработки данных
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    const normalizedIp = clientIp === "::1" ? "127.0.0.1" : clientIp;

    const fData = {
      // company: parsedData.receipts.receipt[0].organizationName, // Имя компании
      company:'12',
      ip: normalizedIp,
      data: parsedData.receipts.receipt,
    };
    console.log('finish',parsedData.receipts.receipt)
    // Сохранение в базе данных (пример)
    const doc = new XMLModel(fData);
    await doc.save();

    // Генерация имени файла
    const fileName = `client_${Date.now()}.xml`;

    // Возвращаем успешный ответ
    res.status(200).send(fileName);
  } catch (error) {
    console.error("Ошибка обработки запроса:", error);
    res.status(500).json({
      message: "Не удалось обработать запрос.",
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
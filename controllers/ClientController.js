import ClientModel from '../models/Client.js';
import fs from 'fs'
import { Builder } from 'xml2js'; 

export const getAll = async (req, res) => {
  try {
    const clients = await ClientModel.find()
      .select('_id name typeBusiness')
      .sort({ createdAt: -1 })
      .exec();  
     
    res.json(clients);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить клиентов',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const clientId = req.params.id;

    const updatedClient = await ClientModel.findOneAndUpdate(
      { _id: clientId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
    ).exec();

    if (!updatedClient) {
      return res.status(404).json({
        message: 'Клиент не найден',
      });
    }

    // Обработка данных клиента
    let totalCost = 0;
    let contractorNames = new Set();

    const financeData = updatedClient.finance;

    // Итерация по годам и месяцам
 
    for (const year in financeData) {
      for (const month in financeData[year]) {
        const monthData = financeData[year][month];

        // Добавление суммы из total
        totalCost += monthData.total || monthData.total || 0;

        // Сбор уникальных contractorName
        monthData.receipts.forEach(receipt => {
          contractorNames.add(receipt.contractorName);
        });
      }
    }

    // Вычисление суммы налога
    const taxRate = updatedClient.tax || 0;
    const taxAmount = totalCost * (taxRate / 100);

    // Формирование ответа
    const response = {
      ...updatedClient.toObject(), // Преобразуем документ в объект
      financeSummary: {
        totalCost,
        taxAmount,
        uniqueContractors: contractorNames.size,
      }
    };

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить клиента',
    });
  }
};


export const remove = async (req, res) => {
  try {
    const clientId = req.params.id;
    ClientModel.findOneAndDelete(
      {
        _id: clientId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить клиента',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Клиент не найден',
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
      message: 'Не удалось получить клиента',
    });
  }
};

export const create = async (req, res) => {
  console.log('Запрос получен с данными:', req.body);

  try {
    const doc = new ClientModel({
      name: req.body.name,
      typeBusiness: req.body.typeBusiness,
      tax: req.body.tax,
      finance: req.body.finance,
    });

    console.log('Созданный документ:', doc);

    const client = await doc.save();

    // Формируем XML-файл на основе данных клиента
    const xmlData = `
      <client>
        <name>${client.name}</name>
        <typeBusiness>${client.typeBusiness}</typeBusiness>
        <tax>${client.tax}</tax>
        <finance>${client.finance}</finance>
      </client>
    `;

    // Генерируем уникальное имя файла
    const fileName = `client_${client._id}.xml`;
    const filePath = `C:/Users/Kalysbek IT/Desktop/1с/${fileName}`; // Укажите путь, где вы хотите сохранить файл

    // Сохраняем XML в файл
    fs.writeFileSync(filePath, xmlData);

    // Возвращаем имя файла в ответе
    res.json({ fileName });
  } catch (err) {
    console.log('Ошибка при создании клиента:', err);
    res.status(500).json({
      message: 'Не удалось создать',
    });
  }
};



export const update = async (req, res) => {
  try {
    const clientId = req.params.id;

    await ClientModel.updateOne(
      {
        _id: clientId,
      },
      {
        name: req.body.name,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить данные клиента',
    });
  }
};

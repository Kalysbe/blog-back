


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


export const create = async (req, res) => {
  const data = req.body; // Если данные передаются в теле запроса
  console.log(JSON.stringify(data, null, 2)); 
  const parsedReceipts = parseReceipts(req.body);
  const groupedData = groupByYearAndQuarter(parsedReceipts);
  console.log(groupedData);

  try {

    const fileName = `client_${Date.now()}.xml`;


    // Сохраняем XML в файл
    // fs.writeFileSync(filePath, xmlData, 'utf-8');
    console.log(`XML успешно сохранен в файл: ${fileName}`);

    // Возвращаем успешный ответ
    res.status(200).send(fileName);
  } catch (error) {
    console.error('Ошибка обработки XML:', error);
    res.status(500).json({
      message: 'Не удалось обработать XML.',
      error: error.message,
    });
  }
};
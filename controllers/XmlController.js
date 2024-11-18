

export const create = async (req, res) => {
  const data = req.body; // Если данные передаются в теле запроса
  console.log(JSON.stringify(data, null, 2)); 


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

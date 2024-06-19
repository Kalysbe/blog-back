import ClientModel from '../models/Client.js';



export const getAll = async (req, res) => {
  try {
    const clients = await ClientModel.find()
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

    ClientModel.findOneAndUpdate(
      {
        _id: clientId,
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
            message: 'Не удалось вернуть клиента',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Клиент не найден',
          });
        }

        res.json(doc);
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
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
  try {
    const doc = new ClientModel({
      name: req.body.name,
    });

    const client = await doc.save();

    res.json(client);
  } catch (err) {
    console.log(err);
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

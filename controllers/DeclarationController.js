import DeclarationModel from '../models/Declaration.js';



export const getAll = async (req, res) => {
  try {
    const declarations = await DeclarationModel.find()
    .populate('user')
    .select('_id title status createdAt user')
    .sort({ createdAt: -1 })
    .exec();
  
    res.json(declarations);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const declarationId = req.params.id;

    DeclarationModel.findOneAndUpdate(
      {
        _id: declarationId,
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
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const declarationId = req.params.id;
    DeclarationModel.findOneAndDelete(
      {
        _id: declarationId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
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
      message: 'Не удалось получить статьи',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new DeclarationModel({
      title: req.body.title,
      user: req.userId,
      status: 1,
      content: req.body.content
    });

    const derlarations = await doc.save();

    res.json(derlarations);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать декларацию',
    });
  }
};

export const update = async (req, res) => {
  try {
    const declarationId = req.params.id;

    await DeclarationModel.updateOne(
      {
        _id: declarationId,
      },
      {
        code: req.body.code,
        title: req.body.title,
        user: req.userId,
        status: 1,
        content: req.body.content
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

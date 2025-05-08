import ContactModel from '../models/Contact.js';

export const getAll = async (req, res) => {
  try {
    const contacts = await ContactModel.find()
      .select('_id firstName lastName email phone createdAt')
      .sort({ createdAt: -1 })
      .exec();  
    
    res.json(contacts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить контакты',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const contactId = req.params.id;

    const contact = await ContactModel.findById(contactId).exec();

    if (!contact) {
      return res.status(404).json({
        message: 'Контакт не найден',
      });
    }

    res.json(contact);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить контакт',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const contactId = req.params.id;
    const deletedContact = await ContactModel.findByIdAndDelete(contactId).exec();

    if (!deletedContact) {
      return res.status(404).json({
        message: 'Контакт не найден',
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить контакт',
    });
  }
};

export const create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    const doc = new ContactModel({
      firstName,
      lastName,
      email,
      phone,
      message
    });

    const contact = await doc.save();
    res.json(contact);
  } catch (err) {
    console.log('Ошибка при создании контакта:', err);
    res.status(500).json({
      message: 'Не удалось создать контакт',
    });
  }
};

export const update = async (req, res) => {
  try {
    const contactId = req.params.id;
    const { firstName, lastName, email, phone, message } = req.body;

    const updatedContact = await ContactModel.findByIdAndUpdate(contactId, {
      firstName,
      lastName,
      email,
      phone,
      message
    }, { new: true }).exec();

    if (!updatedContact) {
      return res.status(404).json({ message: 'Контакт не найден' });
    }

    res.json(updatedContact);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить данные контакта',
    });
  }
};

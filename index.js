const express = require('express');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const xmlparser = require('express-xml-bodyparser');
const mongoose = require('mongoose');
const { registerValidation, loginValidation, postCreateValidation } = require('./validations.js');
const { handleValidationErrors, checkAuth } = require('./utils/index.js');
const { UserController, PostController, DeclarationController, ClientController, XmlController } = require('./controllers/index.js');

mongoose.set('strictQuery', false);

mongoose
  .connect('mongodb+srv://rrkalysbe:123123kk@cluster0.cr98zh3.mongodb.net/blog?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

// Устанавливаем базовый путь для API в зависимости от среды
const apiPrefix = process.env.NODE_ENV === 'production' ? '/api' : '';

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Логины и регистрация
app.post(`${apiPrefix}/auth/login`, loginValidation, handleValidationErrors, UserController.login);
app.post(`${apiPrefix}/users`, checkAuth, registerValidation, handleValidationErrors, UserController.register);
app.put(`${apiPrefix}/users/:id`, checkAuth, handleValidationErrors, UserController.update);
app.delete(`${apiPrefix}/users/:id`, checkAuth, handleValidationErrors, UserController.remove);
app.get(`${apiPrefix}/auth/me`, checkAuth, UserController.getMe);
app.get(`${apiPrefix}/users`, UserController.getAll);

// Загрузка файлов
app.post(`${apiPrefix}/upload`, checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

// Посты
app.get(`${apiPrefix}/posts`, PostController.getAll);
app.get(`${apiPrefix}/posts/tags`, PostController.getLastTags);
app.get(`${apiPrefix}/posts/:id`, PostController.getOne);
app.post(`${apiPrefix}/posts`, checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete(`${apiPrefix}/posts/:id`, checkAuth, PostController.remove);
app.patch(`${apiPrefix}/posts/:id`, checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

// Декларации
app.get(`${apiPrefix}/declarations`, DeclarationController.getAll);
app.get(`${apiPrefix}/declarations/:id`, DeclarationController.getOne);
app.post(`${apiPrefix}/declarations`, checkAuth, handleValidationErrors, DeclarationController.create);
app.delete(`${apiPrefix}/declarations/:id`, checkAuth, DeclarationController.remove);
app.put(`${apiPrefix}/declarations/:id`, checkAuth, handleValidationErrors, DeclarationController.update);

// Клиенты
app.get(`${apiPrefix}/clients`, ClientController.getAll);
app.get(`${apiPrefix}/clients/:id`, ClientController.getOne);
app.post(`${apiPrefix}/clients`, handleValidationErrors, ClientController.create);
app.delete(`${apiPrefix}/clients/:id`, ClientController.remove);
app.put(`${apiPrefix}/clients/:id`, handleValidationErrors, ClientController.update);

// XML
app.post(`${apiPrefix}/xml`, xmlparser(), XmlController.create);
app.post(`${apiPrefix}/xml/convert`, xmlparser(), XmlController.converter);

// Запуск сервера
app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});

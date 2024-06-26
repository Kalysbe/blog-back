import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import mongoose from 'mongoose';

mongoose.set('strictQuery', false);
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController, DeclarationController, ClientController } from './controllers/index.js';

mongoose
  .connect('mongodb+srv://rrkalysbe:123123kk@cluster0.cr98zh3.mongodb.net/blog?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

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

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/users',checkAuth, registerValidation, handleValidationErrors, UserController.register);
app.put('/users/:id',checkAuth,handleValidationErrors, UserController.update,);
app.delete('/users/:id',checkAuth,handleValidationErrors, UserController.remove,);
app.get('/auth/me', checkAuth, UserController.getMe);
app.get('/users', UserController.getAll);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

//Декларации
app.get('/declarations', DeclarationController.getAll);
app.get('/declarations/:id', DeclarationController.getOne);
app.post('/declarations', checkAuth, handleValidationErrors, DeclarationController.create);
app.delete('/declarations/:id', checkAuth, DeclarationController.remove);
app.put(
  '/declarations/:id',
  checkAuth,
  handleValidationErrors,
  DeclarationController.update,
)

//Клиенты
app.get('/clients', ClientController.getAll);
app.get('/clients/:id', ClientController.getOne);
app.post('/clients', handleValidationErrors, ClientController.create);
app.delete('/clients/:id',  ClientController.remove);
app.put('/clients/:id',handleValidationErrors,ClientController.update,)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});

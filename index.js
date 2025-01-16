import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import xmlparser from 'express-xml-bodyparser';
import bodyParser  from 'body-parser';
import mongoose from 'mongoose';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';
import { UserController, PostController, DeclarationController, ClientController, XmlController, EmailController } from './controllers/index.js';

mongoose.set('strictQuery', false);

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



app.post(`/api/auth/login`, loginValidation, handleValidationErrors, UserController.login);
app.post(`/api/users`, checkAuth, registerValidation, handleValidationErrors, UserController.register);
app.put(`/api/users/:id`, checkAuth, handleValidationErrors, UserController.update);
app.delete(`/api/users/:id`, checkAuth, handleValidationErrors, UserController.remove);
app.get(`/api/auth/me`, checkAuth, UserController.getMe);
app.get(`/api/users`, UserController.getAll);

app.post(`/api/upload`, checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get(`/api/posts`, PostController.getAll);
app.get(`/api/posts/tags`, PostController.getLastTags);
app.get(`/api/posts/:id`, PostController.getOne);
app.post(`/api/posts`, checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete(`/api/posts/:id`, checkAuth, PostController.remove);
app.patch(`/api/posts/:id`, checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.get(`/api/declarations`, DeclarationController.getAll);
app.get(`/api/declarations/:id`, DeclarationController.getOne);
app.post(`/api/declarations`, checkAuth, handleValidationErrors, DeclarationController.create);
app.delete(`/api/declarations/:id`, checkAuth, DeclarationController.remove);
app.put(`/api/declarations/:id`, checkAuth, handleValidationErrors, DeclarationController.update);

app.get(`/api/clients`, ClientController.getAll);
app.get(`/api/clients/:id`, ClientController.getOne);
app.post(`/api/clients`, handleValidationErrors, ClientController.create);
app.delete(`/api/clients/:id`, ClientController.remove);
app.put(`/api/clients/:id`, handleValidationErrors, ClientController.update);

app.post('/api/xml', bodyParser.text({ type: 'application/xml' }), XmlController.create);
app.get(`/api/xml`, XmlController.getAll);
app.get(`/api/xml/:id`, XmlController.getOne);
app.post(`/api/xml/convert`, bodyParser.text({ type: 'application/xml' }), XmlController.converter);

app.get(`/api/email/users`,EmailController.getAll);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});

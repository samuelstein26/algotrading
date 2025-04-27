import express from 'express';
const router = express.Router();
import  user  from '../controllers/auth.js';
import getMe from '../controllers/userController.js';
import authenticate from '../middlewares/authMiddleware.js';
import  usernameCheck from '../controllers/usernameCheck.js';
import userRegistration from '../controllers/userRegistration.js';
import newsletterInsert from '../controllers/newsletterInsert.js';
import uploadImage from '../controllers/uploadImage.js';
import savePost from '../controllers/savePost.js';
import upload from '../middlewares/multerMiddleware.js';

// Rotas públicas
router.post('/register', userRegistration);
router.post('/login', user.login);
router.get('/usernamecheck', usernameCheck);
router.post('/recuperacaoconta', user.forgotPassword);
router.post('/resetpassword', user.resetPassword);
router.post('/newsletter', newsletterInsert);
router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/save-post', upload.none(), savePost);

// Rota protegida
router.get('/logout', authenticate, getMe);
router.get('/verify', authenticate, getMe);

export default router;
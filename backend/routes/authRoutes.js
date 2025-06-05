import express from 'express';
const router = express.Router();

import user from '../controllers/auth/auth.js';
import userController from '../controllers/users/userController.js';
import authenticate from '../middlewares/authMiddleware.js';
import usernameCheck from '../controllers/users/usernameCheck.js';
import userRegistration from '../controllers/users/userRegistration.js';
import newsletterInsert from '../controllers/others/newsletterInsert.js';
import uploadImage from '../controllers/images/uploadImage.js';
import savePost from '../controllers/posts/savePost.js';
import { upload } from '../middlewares/multerMiddleware.js';
import fetchUserPosts from '../controllers/posts/fetchUserPosts.js';
import fetchPostImageCover from '../controllers/images/fetchPostImageCover.js';
import fetchImage from '../controllers/images/fetchImage.js';
import deletePost from '../controllers/posts/deletePost.js';
import { deleteImagePost } from '../controllers/images/deleteImagePost.js';
import { updatePost } from '../controllers/posts/updatePost.js';
import fetchPosts from '../controllers/posts/fetchPosts.js';
import fetchUserName from '../controllers/users/fetchUserName.js';
import votes from '../controllers/users/votes.js';
import favoriteSymbol from "../controllers/others/favoritesymbol.js";
import prompts from '../controllers/prompts/prompt.js';
import generateCode from '../controllers/prompts/generateCode.js';
import codeGenerated from '../controllers/prompts/codeGenerated.js';
import createContato from '../controllers/others/contato.js';

// Rotas públicas
router.get('/usernamecheck', usernameCheck);

router.post('/newsletter', newsletterInsert);

router.post('/register', userRegistration.createUser);

router.post('/contato', createContato)

router.post('/login', user.login);
router.post('/recuperacaoconta', user.forgotPassword);
router.post('/resetpassword', user.resetPassword);

router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/save-post', upload.none(), savePost);

// Rota protegida
router.get('/logout', authenticate, userController.verify);
router.get('/verify', authenticate, userController.verify);
router.get('/me/:userId', authenticate, userController.getMe);

router.get('/posts/user/:userId', authenticate, fetchUserPosts);
router.get('/image/post/:id', authenticate, fetchPostImageCover);
router.get('/image/:filename', authenticate, fetchImage);
router.get('/posts', authenticate, fetchPosts);
router.get('/user/:userId', authenticate, fetchUserName);

router.get('/votelist/:userId', authenticate, votes.getList);
router.post('/vote', authenticate, votes.createVote);
router.put('/vote/:postId/:userId', authenticate, votes.editVote);
router.delete('/vote/:postId/:userId', authenticate, votes.deleteVote);

router.post('/delete-post', authenticate, deletePost);
router.post('/delete-image-post', authenticate, deleteImagePost);
router.post('/update-post', authenticate, updatePost);

router.post('/insert-symbol', authenticate, favoriteSymbol.createFavoriteSymbol);
router.delete('/delete-symbol', authenticate, favoriteSymbol.deleteFavoriteSymbol);
router.get('/get-symbols/:userId', authenticate, favoriteSymbol.getFavoriteSymbols);

router.get('/prompts/:prompId', authenticate, prompts.getPrompt);
router.get('/prompts-list/:userId/:type', authenticate, prompts.getListPrompt);
router.post('/create-prompt', authenticate, prompts.createPrompt);
router.delete('/delete-prompt/:promptId/:userId', authenticate, prompts.deletePrompt);
router.post('/generate-code', authenticate, generateCode);
router.put('/update-prompt', authenticate, prompts.updatePrompt);

router.get('/code/:id', authenticate, codeGenerated);

router.put('/update-user', authenticate, userRegistration.updateUser);
router.put('/update-password', authenticate, userRegistration.updatePassword);

export default router;
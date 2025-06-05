import getConnection from "../../models/db.js";
import { deleteImagePost } from "../images/deleteImagePost.js";
import { processDeltaImages, saveBase64Image, isBase64Image } from "../../utils/imageService.js";

const updatePost = async (req, res) => {
    const { storedUserId, postId, title, image, delta } = req.body;

    if (storedUserId || !postId) {
        console.log('ID do post ou ID do usuário não foram fornecidos');
        return res.status(400).json({ message: 'ID do post ou ID do usuário não foram fornecidos' });
    }


    const isImageBase64 = await isBase64Image(image);

    try {
        if (image) {
            await deleteImagePost(postId, isImageBase64, false);
        }

        const { processedDelta, imagePaths } = await processDeltaImages(delta, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString() + 'n'; // Add 'n' to identify as BigInt
            }
            return value;
        });

        const conn = await getConnection();
        await conn.beginTransaction();

        try {

            const postResult = await conn.query(
                'UPDATE posts SET title = ?, content_delta = ? WHERE id = ?',
                [title, processedDelta, postId]
            );

            // Insere a imagem de capa
            if (isImageBase64) {
                const { filePath } = await saveBase64Image(image);
                console.log('Arquivo Image cover salvo:', filePath);
                await conn.query(
                    'INSERT INTO post_image_cover (post_id, storage_path) VALUES (?, ?)',
                    [postId, filePath]
                );
            }

            // Insere as imagens na tabela de mídias
            for (const imgPath of imagePaths) {
                if (!imgPath) continue;
                await conn.query(
                    'INSERT INTO post_media (post_id, original_name, storage_path, display_order) VALUES (?, ?, ?, ?)',
                    [postId, imgPath.originalName, imgPath.storagePath, imgPath.displayOrder]
                );
            }

            await conn.commit();

            res.status(200).json({ success: true, message: 'Post atualizado com sucesso' });
        } catch (dbError) {
            await conn.rollback();
            throw dbError;
        } finally {
            if (conn) conn.release();
        }

    } catch (err) {
        console.error('Erro ao atualizar post:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }

}

export { updatePost };
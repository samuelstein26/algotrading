import getConnection from "../../models/db.js";
import { processDeltaImages, saveBase64Image } from "../../utils/imageService.js";

const savePost = async (req, res) => {
    try {

        const { storedUserID, title, image, delta } = req.body;

        const { processedDelta, imagePaths } = await processDeltaImages(delta, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString() + 'n'; // Add 'n' to identify as BigInt
            }
            return value;
        });

        // Inicia transação no banco de dados
        const conn = await getConnection();
        await conn.beginTransaction();

        try {
            const postResult = await conn.query(
                'INSERT INTO posts (title, content_delta, user_id) VALUES (?, ?, ?)',
                [title, processedDelta, storedUserID]
            );
            const postId = postResult.insertId;

            // Insere a imagem de capa
            if (postId && image !== null) {
                const { filePath } = await saveBase64Image(image);
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

            const id = postId.toString();

            res.status(200).json({ success: true, id });
        } catch (dbError) {
            await conn.rollback();
            throw dbError;
        } finally {
            if (conn) conn.release();
        }
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export default savePost;
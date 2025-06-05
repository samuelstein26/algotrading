import getConnection from "../../models/db.js";
import { deleteFiles } from "../../middlewares/multerMiddleware.js";

const deleteImagePost = async (id, isBase64 = false, deleteAll = false) => {
    try {
        const conn = await getConnection();

        if (isBase64 || deleteAll) {
            const [coverImages] = await conn.query('SELECT storage_path FROM post_image_cover WHERE post_id = ?', [id]);
            if (coverImages) {
                await deleteFiles(coverImages);
                await conn.query('DELETE FROM post_image_cover WHERE post_id = ?', [id]);
            }
        }

        const [mediaFiles] = await conn.query('SELECT storage_path FROM post_media WHERE post_id = ?', [id]);
        if (mediaFiles) {
            await deleteFiles(mediaFiles);
            await conn.query('DELETE FROM post_media WHERE post_id = ?', [id]);
        }

        conn.release();
    } catch (err) {
        console.error('Erro ao excluir imagem:', err);
    }
}

export { deleteImagePost };
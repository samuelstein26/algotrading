import getConnection from "../../models/db.js";

const fetchPosts = async (req, res) => {
    try {
        const conn = await getConnection();

        const posts = await conn.query('SELECT * FROM posts LIMIT 30');

        conn.release();
        res.status(200).json(posts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default fetchPosts;    
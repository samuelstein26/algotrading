const uploadImage = async (req, res) => {
    try {

        if (!req.file || !req.file.filename) {
            return res.status(400).json({ error: 'Nenhuma imagem válida enviada' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

export default uploadImage;
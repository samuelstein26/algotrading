import dotenv from 'dotenv';
import axios from 'axios';

const generateCode = async (req, res) => {
    dotenv.config();

    try {
        const { prompt, model = "deepseek-coder" } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const messages = [
            {
                role: "user",
                content: `Gere um código MQL5 onde a estratégia seja baseada na seguinte descrição: ${prompt}. 
                Por favor, forneça apenas o código sem comentários explicativos, introdução ou instruções. 
                Também não inclua \`\`\`mql5 ou \`\`\`. 
                Certifique-se de que o código é funcional e segue as melhores práticas de MQL5.
                Evite erros como “cannot convert 0 to enum 'ENUM_TRADE_REQUEST_ACTIONS'.
                Utilize a biblioteca CTrade e faça compra no mercado, não o envio de ordens.
                Nao esquece de importar a biblioteca CTrade no cabeçalho do código.`
            }
        ];

        const response = await axios.post(
            `${process.env.DEEPSEEK_API_URL}/chat/completions`,
            {
                model,
                messages,
                temperature: 0.3,
                max_tokens: 2048
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedCode = response.data.choices[0].message.content;
        res.json({ code: generatedCode });

    } catch (error) {
        console.error('Error calling DeepSeek API:', error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate MQL5 code" });
    }
};

export default generateCode;
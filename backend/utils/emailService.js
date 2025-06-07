import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_ACCOUNT_USER,
    pass: process.env.EMAIL_ACCOUNT_PASSWORD
  }
});

async function sendTempPasswordEmail(email, tempPassword) {
  try {
    const mailOptions = {
      from: `"Time de Suporte da Algotrading Sistema" <${process.env.EMAIL_ACCOUNT_USER}>`,
      to: email,
      subject: 'Your Temporary Password',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Senha Temporária</h2>
          <p>Abaixo está sua senha temporária:</p>
          <div style="background: #f4f4f4; padding: 10px; margin: 15px 0; display: inline-block;">
            <strong>${tempPassword}</strong>
          </div>
          <p>Essa senha expira em 1 horas.</p>
          <p>Por favor, use essa senha para acessar o sistema e altere-a.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error; 
  }
}

export default sendTempPasswordEmail;
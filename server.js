const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Настройка почтового транспорта для Яндекс (хардкод)
const transporter = nodemailer.createTransport({
    host: 'smtp.msndr.net',
    port: 465,
    secure: true,
    auth: {
        user: 'sincereapologies@ya.ru',
        pass: '9fe69a95866972c2d8574f681b212912'
    }
});

// Маршрут для отправки документов
app.post('/api/send-documents', upload.single('archive'), async (req, res) => {
    try {
        const { clientName, clientEmail, timestamp } = req.body;
        const archivePath = req.file.path;

        // Настройка email
        const mailOptions = {
            from: 'info@intech.insure',
            to: 'sincereapologies@ya.ru',
            subject: `Страховое заявление от ${clientName}`,
            html: `
        <h2>Новое страховое заявление</h2>
        <p><strong>Клиент:</strong> ${clientName}</p>
        <p><strong>Email:</strong> ${clientEmail}</p>
        <p><strong>Дата отправки:</strong> ${new Date(timestamp).toLocaleString('ru-RU')}</p>
        <p>В приложении находятся документы:</p>
        <ul>
          <li>страховое_заявление.pdf</li>
          <li>электронная_подпись.sig</li>
        </ul>
      `,
            attachments: [
                {
                    filename: 'страховые_документы.zip',
                    path: archivePath
                }
            ]
        };

        // Отправка email
        await transporter.sendMail(mailOptions);

        // Удаляем временный файл
        fs.unlinkSync(archivePath);

        res.json({
            success: true,
            message: 'Документы успешно отправлены'
        });

    } catch (error) {
        console.error('Ошибка отправки:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = 1488;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
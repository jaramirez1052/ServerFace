const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

const repoDir = '';
const secret = '';

app.use(express.json());

app.post('/webhook', (req, res) => {
    // Verificar firma del webhook (seguridad)
    const signature = req.headers['x-hub-signature-256'];
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        return res.status(401).send('Firma de webhook inválida');
    }

    // Verificar si es un push a la rama main
    if (req.body.ref === 'refs/heads/main') {
        const commands = [
            `cd ${repoDir}`,
            'git pull origin main',
            'npm install',
            'pm2 restart ecosystem.config.js'
        ];

        // Ejecutar comandos y recopilar salida
        let output = '';
        const execCommand = (command) => {
            return new Promise((resolve, reject) => {
                exec(command, (err, stdout, stderr) => {
                    output += stdout + stderr;
                    if (err) reject(err);
                    else resolve();
                });
            });
        };

        commands.reduce((acc, command) => acc.then(() => execCommand(command)), Promise.resolve())
            .then(() => res.status(200).json({ message: 'Actualización exitosa', output }))
            .catch(err => res.status(500).json({ message: 'Error durante la actualización', output }));
    } else {
        res.status(202).json({ message: 'No se requiere actualización' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor webhook escuchando en el puerto ${PORT}`);
});
const express = require('express');
const routes = require('./routes/routes');
const venom = require('venom-bot');
const handleMessage = require('./bot/messageHandler');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', routes);

// Inicia o servidor Express
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

venom
  .create({
    session: 'botello',
    headless: false,
    devtools: false,
    browserArgs: ['--no-sandbox'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })
  .then((client) => {
    console.log('🤖 Bot conectado!');

    client.onMessage(async (message) => {
      try {
        if (!client || !message || !message.from) {
          console.warn('⚠️ Mensagem ou client inválido detectado. Ignorando...');
          return;
        }

        console.log('📩 Mensagem recebida de:', message.from);
        await handleMessage(client, message);
      } catch (err) {
        console.error('❌ Erro ao processar mensagem:', err);
        if (message?.from) {
          try {
            await client.sendText(message.from, '⚠️ Ocorreu um erro ao processar sua mensagem. Tente novamente.');
          } catch (sendErr) {
            console.error('❌ Erro ao enviar mensagem de erro:', sendErr);
          }
        }
      }
    });
  })
  .catch((err) => {
    console.error('Erro ao iniciar o bot:', err);
  });

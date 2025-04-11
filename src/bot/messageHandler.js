const supabase = require('../libs/supabaseClient');
const { services, dates, hours } = require('./agenda.json');

const agendamentos = {};

module.exports = async function handleMessage(client, message) {
  try {
    const user = message.from;

    if (message.isGroupMsg) return;

    if (!agendamentos[user]) {
      agendamentos[user] = { step: 0 };
    }

    const state = agendamentos[user];

    switch (state.step) {
      case 0:
        await client.sendText(user, '👋 Olá! Qual é o seu nome?');
        state.step++;
        break;

      case 1:
        state.nome = message.body;
        let servicosStr = services.map((s, i) => `${i + 1}. ${s}`).join('\n');
        await client.sendText(user, `✂️ Qual serviço deseja?\n\n${servicosStr}`);
        state.step++;
        break;

      case 2: {
        const servicoIndex = parseInt(message.body) - 1;
        if (servicoIndex >= 0 && servicoIndex < services.length) {
          state.servico = services[servicoIndex];

          let datasStr = dates.map((d, i) => `${i + 1}. ${d}`).join('\n');
          await client.sendText(user, `📅 Escolha uma data:\n\n${datasStr}`);
          state.step++;
        } else {
          await client.sendText(user, '❌ Serviço inválido. Envie o número correspondente.');
        }
        break;
      }

      case 3: {
        const dataIndex = parseInt(message.body) - 1;
        if (dataIndex >= 0 && dataIndex < dates.length) {
          const [dia, mes] = dates[dataIndex].split('/');
          const dataFormatada = `2025-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          state.data = dataFormatada;

          let horasStr = hours.map((h, i) => `${i + 1}. ${h}`).join('\n');
          await client.sendText(user, `⏰ Escolha um horário:\n\n${horasStr}`);
          state.step++;
        } else {
          await client.sendText(user, '❌ Data inválida. Envie o número correspondente.');
        }
        break;
      }

      case 4: {
        const horaIndex = parseInt(message.body) - 1;
        if (horaIndex >= 0 && horaIndex < hours.length) {
          state.hora = hours[horaIndex];

          const { error } = await supabase.from('agendamentos').insert([
            {
              nome: state.nome,
              servico: state.servico,
              data: state.data,
              hora: state.hora,
            },
          ]);

          if (error) {
            console.error('Erro ao salvar no Supabase:', error);
            await client.sendText(user, '❌ Ocorreu um erro ao salvar seu agendamento. Tente novamente.');
          } else {
            await client.sendText(user, `✅ Agendamento confirmado!\n\n🙍 Nome: ${state.nome}\n✂️ Serviço: ${state.servico}\n📅 Data: ${dates.find(d => state.data.endsWith(d.split('/')[0].padStart(2, '0')))}\n⏰ Hora: ${state.hora}`);
          }

          delete agendamentos[user];
        } else {
          await client.sendText(user, '❌ Horário inválido. Envie o número correspondente.');
        }
        break;
      }

      default:
        await client.sendText(user, '❗ Algo deu errado. Vamos começar de novo. Qual é o seu nome?');
        agendamentos[user] = { step: 1 };
        break;
    }
  } catch (err) {
    console.error('Erro no handleMessage:', err);
    if (message?.from) {
      await client.sendText(message.from, '⚠️ Ocorreu um erro inesperado. Tente novamente.');
    }
  }
};

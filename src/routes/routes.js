const express = require('express');
const supabase = require('../libs/supabaseClient');

const router = express.Router();

// 📌 1. Buscar todos os agendamentos
router.get('/agendados', async (req, res) => {
  const { data, error } = await supabase.from('agendamentos').select('*');

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});


// 📌 2. Criar novo agendamento
router.post('/agendar', async (req, res) => {
  const { nome, data, hora, servico } = req.body;

  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .insert([{ nome, data, hora, servico }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(agendamento);
});

// 📌 3. Editar agendamento por ID
router.put('/agendar/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, data, hora, servico } = req.body;

  const { data: atualizado, error } = await supabase
    .from('agendamentos')
    .update({ nome, data, hora, servico })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(atualizado);
});

// 📌 4. Excluir agendamento por ID
router.delete('/agendar/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send(); // 204: No Content
});

module.exports = router;

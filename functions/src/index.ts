import {onSchedule} from "firebase-functions/v2/scheduler";
import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

/**
 * Pega o horário atual do servidor e formata como YYYY-MM-DDTHH:mm.
 * @return {string} Data formatada em string.
 */
function obterDataFormatada(): string {
  const agora = new Date();
  agora.setHours(agora.getHours() - 3);
  return agora.toISOString().slice(0, 16);
}

/**
 * Busca mensagens agendadas vencidas e altera o status para enviado.
 * @return {Promise<number>} Número de mensagens processadas.
 */
async function processarMensagensAgendadas(): Promise<number> {
  const dataLimite = obterDataFormatada();
  logger.info(`Checando agendamentos até: ${dataLimite}`);

  const mensagensRef = db.collection("mensagens");

  const snapshot = await mensagensRef
    .where("status", "==", "agendada")
    .where("dataAgendamento", "<=", dataLimite)
    .get();

  if (snapshot.empty) {
    logger.info("Nenhuma mensagem agendada para disparar.");
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {status: "enviada"});
  });

  await batch.commit();
  logger.info(`Sucesso! ${snapshot.size} mensagem(ns) disparadas.`);
  return snapshot.size;
}

export const checadorAgendamentosCron = onSchedule(
  "every 1 minutes",
  async () => {
    await processarMensagensAgendadas();
  }
);

export const dispararMensagensManualmente = onRequest(async (req, res) => {
  try {
    const total = await processarMensagensAgendadas();
    res.status(200).send({
      sucesso: true,
      mensagem: `Processamento concluído. ${total} mensagens enviadas.`,
      horarioVerificado: obterDataFormatada(),
    });
  } catch (error) {
    const err = error as Error;
    logger.error("Erro na rota HTTP de agendamentos:", err);
    res.status(500).send({
      sucesso: false,
      erro: err.message,
    });
  }
});


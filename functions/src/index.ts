import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Inicializa o Admin SDK para termos acesso total ao banco de dados no backend
initializeApp();
const db = getFirestore();

/**
 * FUNÇÃO AJUDANTE (Pure Function)
 * Pega o horário atual do servidor e formata como YYYY-MM-DDTHH:mm 
 * para bater exatamente com o formato string salvo pelo input datetime-local do HTML.
 */
function obterDataFormatada(): string {
  const agora = new Date();
  // Ajuste para o fuso horário de Brasília (UTC-3).
  agora.setHours(agora.getHours() - 3); 
  return agora.toISOString().slice(0, 16);
}

/**
 * LÓGICA DE NEGÓCIO PRINCIPAL
 * Busca mensagens agendadas vencidas e altera o status para enviado.
 */
async function processarMensagensAgendadas() {
  const dataLimite = obterDataFormatada();
  logger.info(`Iniciando checagem. Procurando mensagens agendadas até: ${dataLimite}`);

  const mensagensRef = db.collection("mensagens");
  
  // Consulta no banco de dados do backend
  const snapshot = await mensagensRef
    .where("status", "==", "agendada")
    .where("dataAgendamento", "<=", dataLimite)
    .get();

  if (snapshot.empty) {
    logger.info("Nenhuma mensagem agendada para disparar neste minuto.");
    return 0;
  }

  // Uso de Batch (Lote) para atualizar até 500 documentos de uma vez só (Clean Code & Performance)
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "enviada" });
  });

  await batch.commit();
  logger.info(`Sucesso! ${snapshot.size} mensagem(ns) foram disparadas.`);
  return snapshot.size;
}

// 1. A FUNÇÃO OFICIAL (Roda automaticamente a cada 1 minuto)
// Nota: Requer Plano Blaze para fazer deploy.
export const checadorAgendamentosCron = onSchedule("every 1 minutes", async (event) => {
  await processarMensagensAgendadas();
});

// 2. A FUNÇÃO DE TESTE (Roda manualmente via URL HTTP)
// Funciona no plano Gratuito (Spark)!
export const dispararMensagensManualmente = onRequest(async (req, res) => {
  try {
    const totalDisparado = await processarMensagensAgendadas();
    res.status(200).send({
      sucesso: true,
      mensagem: `Processamento concluído. ${totalDisparado} mensagens foram enviadas.`,
      horarioVerificado: obterDataFormatada()
    });
  } catch (error: any) {
    logger.error("Erro na rota HTTP de agendamentos:", error);
    res.status(500).send({ sucesso: false, erro: error.message });
  }
});
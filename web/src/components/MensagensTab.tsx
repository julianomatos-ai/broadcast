import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ContatoRepository } from "../repositories/ContatoRepository";
import { MensagemRepository } from "../repositories/MensagemRepository";
import { Box, Alert } from "@mui/material";
import { MensagensFormulario } from "./MensagensTab/MensagensFormulario";
import { MensagensLista } from "./MensagensTab/MensagensLista";
import { useFirestoreError } from "../hooks/useFirestoreError";
import type { Contato } from "../repositories/ContatoRepository";
import type { Mensagem } from "../repositories/MensagemRepository";

export function MensagensTab() {
    const { user } = useAuth();
    const { mapError } = useFirestoreError();

    // Estados
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [filtroStatus, setFiltroStatus] = useState<"todas" | "enviada" | "agendada">("todas");
    const [loadingList, setLoadingList] = useState(true);

    // 1. Carrega os contatos disponíveis para preencher o Select Dropdown
    useEffect(() => {
        if (!user) return;
        const unsubscribe = ContatoRepository.listarPorCliente(user.uid, (lista) => {
            setContatos(lista);
        });
        return () => unsubscribe();
    }, [user]);

    // 2. Carrega as mensagens em tempo real
    useEffect(() => {
        if (!user) return;
        const unsubscribe = MensagemRepository.listarPorCliente(user.uid, (lista) => {
            setMensagens(lista);
            setLoadingList(false);
        });
        return () => unsubscribe();
    }, [user]);

    // CREATE / DISPARAR
    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const customEvent = e as any;
        const { selectedContatos, texto, tipoEnvio, dataAgendamento } = customEvent.data;
        
        if (!user || selectedContatos.length === 0 || !texto.trim()) return;
        if (tipoEnvio === "agendado" && !dataAgendamento) {
            return setError("Por favor, selecione uma data e hora para o agendamento.");
        }

        setLoadingAdd(true); setError(""); setSuccess("");

        try {
            // Loop para criar um documento de mensagem para cada contato selecionado (Clean Multi-tenant)
            for (const contatoId of selectedContatos) {
                const contatoInfo = contatos.find(c => c.id === contatoId);

                await MensagemRepository.criar(
                    contatoId,
                    contatoInfo?.nome || "Contato Removido",
                    texto,
                    tipoEnvio === "direto" ? "enviada" : "agendada",
                    tipoEnvio === "agendado" ? dataAgendamento : null,
                    user.uid
                );
            }

            setSuccess(`Mensagem processada com sucesso para ${selectedContatos.length} contato(s)!`);
        } catch (err) {
            setError(mapError(err));
        } finally {
            setLoadingAdd(false);
        }
    };

    // DELETE (Cancelar agendamento ou excluir histórico)
    const handleDeleteMessage = async (id: string) => {
        try {
            await MensagemRepository.deletar(id);
            setSuccess("Registro de mensagem removido com sucesso.");
        } catch (err) {
            setError(mapError(err));
        }
    };

    // Filtragem local baseada no estado do ToggleButton (Paradigma Funcional)
    const mensagensFiltradas = useMemo(() => 
        mensagens.filter(msg => {
            if (filtroStatus === "todas") return true;
            return msg.status === filtroStatus;
        }),
        [mensagens, filtroStatus]
    );

    return (
        <Box>
            {success && <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>{success}</Alert>}
            {error && <Alert severity="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

            {/* Formulário de Envio/Agendamento */}
            <MensagensFormulario
                contatos={contatos}
                loadingAdd={loadingAdd}
                onSendMessage={handleSendMessage}
            />

            <div className="my-8 border-t" />

            {/* Lista de Mensagens */}
            <MensagensLista
                mensagens={mensagens}
                mensagensFiltradas={mensagensFiltradas}
                filtroStatus={filtroStatus}
                loadingList={loadingList}
                onFilterChange={(_e, val) => val && setFiltroStatus(val)}
                onDelete={handleDeleteMessage}
            />
        </Box>
    );
}
import { useState, type FormEvent, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
    Typography, Button, Box, TextField, Alert, CircularProgress,
    List, ListItem, ListItemText, Paper, Divider, IconButton,
    Select, MenuItem, InputLabel, FormControl, ToggleButtonGroup, ToggleButton, Chip
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Contato {
    id: string;
    nome: string;
    telefone: string;
}

interface Mensagem {
    id: string;
    contatoId: string;
    contatoNome: string;
    texto: string;
    status: "enviada" | "agendada";
    dataAgendamento: string | null;
    clientId: string;
}

export function MensagensTab() {
    const { user } = useAuth();

    // Estados do formulário
    const [selectedContatos, setSelectedContatos] = useState<string[]>([]);
    const [texto, setTexto] = useState("");
    const [tipoEnvio, setTipoEnvio] = useState<"direto" | "agendado">("direto");
    const [dataAgendamento, setDataAgendamento] = useState("");
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Estados dos dados buscados do Firebase
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [filtroStatus, setFiltroStatus] = useState<"todas" | "enviada" | "agendada">("todas");
    const [loadingList, setLoadingList] = useState(true);

    // 1. Carrega os contatos disponíveis para preencher o Select Dropdown
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "contatos"), where("clientId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista: Contato[] = [];
            snapshot.forEach((doc) => { lista.push({ id: doc.id, ...doc.data() } as Contato); });
            setContatos(lista);
        });
        return () => unsubscribe();
    }, [user]);

    // 2. Carrega as mensagens em tempo real
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "mensagens"),
            where("clientId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista: Mensagem[] = [];
            snapshot.forEach((doc) => { lista.push({ id: doc.id, ...doc.data() } as Mensagem); });
            setMensagens(lista);
            setLoadingList(false);
        }, (err) => {
            // CORREÇÃO: Agora o erro com o link do índice vai aparecer no F12!
            console.error("Erro ao carregar mensagens:", err);
            setLoadingList(false);
        });

        return () => unsubscribe();
    }, [user]);

    // CREATE / DISPARAR
    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || selectedContatos.length === 0 || !texto.trim()) return;
        if (tipoEnvio === "agendado" && !dataAgendamento) {
            return setError("Por favor, selecione uma data e hora para o agendamento.");
        }

        setLoadingAdd(true); setError(""); setSuccess("");

        try {
            // Loop para criar um documento de mensagem para cada contato selecionado (Clean Multi-tenant)
            for (const contatoId of selectedContatos) {
                const contatoInfo = contatos.find(c => c.id === contatoId);

                await addDoc(collection(db, "mensagens"), {
                    contatoId,
                    contatoNome: contatoInfo?.nome || "Contato Removido",
                    texto: texto.trim(),
                    status: tipoEnvio === "direto" ? "enviada" : "agendada",
                    dataAgendamento: tipoEnvio === "agendado" ? dataAgendamento : null,
                    clientId: user.uid,
                    createdAt: new Date()
                });
            }

            setSuccess(`Mensagem processada com sucesso para ${selectedContatos.length} contato(s)!`);
            setSelectedContatos([]);
            setTexto("");
            setDataAgendamento("");
            setTipoEnvio("direto");
        } catch {
            setError("Erro ao processar o envio das mensagens.");
        } finally {
            setLoadingAdd(false);
        }
    };

    // DELETE (Cancelar agendamento ou excluir histórico)
    const handleDeleteMessage = async (id: string) => {
        try {
            await deleteDoc(doc(db, "mensagens", id));
            setSuccess("Registro de mensagem removido com sucesso.");
        } catch {
            setError("Erro ao remover a mensagem.");
        }
    };

    // Filtragem local baseada no estado do ToggleButton (Paradigma Funcional)
    const mensagensFiltradas = mensagens.filter(msg => {
        if (filtroStatus === "todas") return true;
        return msg.status === filtroStatus;
    });

    return (
        <Box>
            {success && <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>{success}</Alert>}
            {error && <Alert severity="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

            {/* Formulário de Envio/Agendamento */}
            <form onSubmit={handleSendMessage} className="flex flex-col gap-5 max-w-2xl">
                <Typography variant="h6" className="text-gray-700 font-medium">Novo Disparo</Typography>

                {/* Select Múltiplo de Contatos */}
                <FormControl fullWidth size="small" required>
                    <InputLabel id="select-contatos-label">Selecionar Contato(s)</InputLabel>
                    <Select
                        labelId="select-contatos-label"
                        multiple
                        value={selectedContatos}
                        onChange={(e) => setSelectedContatos(e.target.value as string[])}
                        label="Selecionar Contato(s)"
                        disabled={loadingAdd || contatos.length === 0}
                        renderValue={(selected) => (
                            <Box className="flex flex-wrap gap-1">
                                {selected.map((value) => {
                                    const c = contatos.find(cont => cont.id === value);
                                    return <Chip key={value} label={c?.nome || value} size="small" />;
                                })}
                            </Box>
                        )}
                    >
                        {contatos.length === 0 ? (
                            <MenuItem disabled>Nenhum contato cadastrado ainda</MenuItem>
                        ) : (
                            contatos.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.nome} ({c.telefone})
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>

                {/* Texto da Mensagem */}
                <TextField
                    label="Conteúdo da Mensagem" variant="outlined" size="small" fullWidth required multiline rows={3}
                    value={texto} onChange={(e) => setTexto(e.target.value)} disabled={loadingAdd}
                    slotProps={{ htmlInput: { maxLength: 500 } }}
                />

                {/* Tipo de Envio & Data/Hora */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <ToggleButtonGroup
                        color="primary" value={tipoEnvio} exclusive size="small"
                        onChange={(_e, val) => val && setTipoEnvio(val)} disabled={loadingAdd}
                    >
                        <ToggleButton value="direto">Enviar Agora</ToggleButton>
                        <ToggleButton value="agendado">Agendar Disparo</ToggleButton>
                    </ToggleButtonGroup>

                    {tipoEnvio === "agendado" && (
                        <TextField
                            type="datetime-local" size="small" required label="Data e Hora do Disparo"
                            value={dataAgendamento} onChange={(e) => setDataAgendamento(e.target.value)}
                            disabled={loadingAdd} slotProps={{ shrink: true } as any}
                            className="w-full sm:w-64"
                        />
                    )}
                </div>

                <Button
                    type="submit" variant="contained" color="primary" className="h-10 self-start px-8"
                    startIcon={!loadingAdd && <SendIcon />} disabled={loadingAdd || selectedContatos.length === 0 || !texto.trim()}
                >
                    {loadingAdd ? <CircularProgress size={24} color="inherit" /> : tipoEnvio === "direto" ? "Enviar" : "Confirmar Agendamento"}
                </Button>
            </form>

            <Divider className="my-8" />

            {/* Cabeçalho da Listagem + Filtros */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Typography variant="h6" className="font-semibold text-gray-700">Histórico de Envios</Typography>

                <ToggleButtonGroup
                    color="secondary" value={filtroStatus} exclusive size="small"
                    onChange={(_e, val) => val && setFiltroStatus(val)}
                >
                    <ToggleButton value="todas">Todas ({mensagens.length})</ToggleButton>
                    <ToggleButton value="enviada">Enviadas</ToggleButton>
                    <ToggleButton value="agendada">Agendadas</ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* Lista em Tempo Real */}
            {loadingList ? (
                <div className="flex h-32 items-center justify-center"><CircularProgress /></div>
            ) : mensagensFiltradas.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-400">Nenhuma mensagem encontrada para o filtro selecionado.</span>
                </div>
            ) : (
                <Paper variant="outlined">
                    <List disablePadding>
                        {mensagensFiltradas.map((msg, index) => (
                            <div key={msg.id}>
                                <ListItem className="py-3 hover:bg-gray-50" secondaryAction={
                                    <IconButton onClick={() => handleDeleteMessage(msg.id)} title={msg.status === 'agendada' ? "Cancelar Agendamento" : "Excluir Registro"}>
                                        <DeleteIcon className="text-gray-500 hover:text-red-500" />
                                    </IconButton>
                                }>
                                    <Box className="mr-4 flex items-center">
                                        {msg.status === "enviada" ? (
                                            <Chip label="Enviada" color="success" size="small" variant="outlined" />
                                        ) : (
                                            <Chip label="Agendada" color="warning" size="small" icon={<AccessTimeIcon />} variant="outlined" />
                                        )}
                                    </Box>
                                    <ListItemText
                                        primary={
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 font-mono">Para: {msg.contatoNome}</span>
                                                <span className="font-normal text-gray-800 mt-0.5">{msg.texto}</span>
                                            </div>
                                        }
                                        secondary={msg.dataAgendamento ? `Agendado para: ${new Date(msg.dataAgendamento).toLocaleString('pt-BR')}` : null}
                                    />
                                </ListItem>
                                {index < mensagensFiltradas.length - 1 && <Divider />}
                            </div>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
}
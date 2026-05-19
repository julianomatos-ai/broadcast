import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { Contato } from "../../repositories/ContatoRepository";
import {
    Typography, Button, TextField, ToggleButtonGroup, ToggleButton,
    Select, MenuItem, InputLabel, FormControl, CircularProgress, Box, Chip
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';

interface MensagensFormularioProps {
    contatos: Contato[];
    loadingAdd: boolean;
    onSendMessage: (e: FormEvent) => void;
}

export function MensagensFormulario({ contatos, loadingAdd, onSendMessage }: MensagensFormularioProps) {
    const { user } = useAuth();
    const [selectedContatos, setSelectedContatos] = useState<string[]>([]);
    const [texto, setTexto] = useState("");
    const [tipoEnvio, setTipoEnvio] = useState<"direto" | "agendado">("direto");
    const [dataAgendamento, setDataAgendamento] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user || selectedContatos.length === 0 || !texto.trim()) return;
        if (tipoEnvio === "agendado" && !dataAgendamento) {
            return;
        }
        
        // Pass data to parent via a custom event or callback
        const customEvent = e as any;
        customEvent.data = {
            selectedContatos,
            texto,
            tipoEnvio,
            dataAgendamento
        };
        onSendMessage(e);
        
        // Reset form
        setSelectedContatos([]);
        setTexto("");
        setDataAgendamento("");
        setTipoEnvio("direto");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-2xl">
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
                        type="datetime-local"
                        size="small"
                        required
                        label="Data e Hora do Disparo"
                        value={dataAgendamento}
                        onChange={(e) => setDataAgendamento(e.target.value)}
                        disabled={loadingAdd}
                        className="w-full sm:w-64"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
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
    );
}

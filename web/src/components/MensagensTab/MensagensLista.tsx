import { CircularProgress, Paper, List, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { AnimatePresence } from 'framer-motion';
import type { Mensagem } from "../../repositories/MensagemRepository";
import { MensagemCard } from "./MensagemCard";

interface MensagensListaProps {
    mensagens: Mensagem[];
    mensagensFiltradas: Mensagem[];
    filtroStatus: "todas" | "enviada" | "agendada";
    loadingList: boolean;
    onFilterChange: (_e: any, val: "todas" | "enviada" | "agendada") => void;
    onDelete: (id: string) => void;
}

export function MensagensLista({ 
    mensagens, 
    mensagensFiltradas, 
    filtroStatus, 
    loadingList, 
    onFilterChange,
    onDelete 
}: MensagensListaProps) {
    return (
        <>
            {/* Cabeçalho da Listagem + Filtros */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Typography variant="h6" className="font-semibold text-gray-700">Histórico de Envios</Typography>

                <ToggleButtonGroup
                    color="secondary" value={filtroStatus} exclusive size="small"
                    onChange={onFilterChange}
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
                        <AnimatePresence mode="popLayout">
                            {mensagensFiltradas.map((msg, index) => (
                                <MensagemCard
                                    key={msg.id}
                                    msg={msg}
                                    isLast={index === mensagensFiltradas.length - 1}
                                    onDelete={onDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </List>
                </Paper>
            )}
        </>
    );
}

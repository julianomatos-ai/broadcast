import { ListItem, ListItemText, IconButton, Box, Chip, Divider } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';
import type { Mensagem } from "../../repositories/MensagemRepository";

interface MensagemCardProps {
    msg: Mensagem;
    isLast: boolean;
    onDelete: (id: string) => void;
}

export function MensagemCard({ msg, isLast, onDelete }: MensagemCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
        >
            <ListItem className="py-3 hover:bg-gray-50" secondaryAction={
                <IconButton onClick={() => onDelete(msg.id)} title={msg.status === 'agendada' ? "Cancelar Agendamento" : "Excluir Registro"}>
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
            {!isLast && <Divider />}
        </motion.div>
    );
}

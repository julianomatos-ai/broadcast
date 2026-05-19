import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ConexaoRepository } from "../repositories/ConexaoRepository";
import { useFirestoreError } from "../hooks/useFirestoreError";
import { motion } from 'framer-motion';
import { 
  Typography, Button, Box, TextField, Alert, CircularProgress, 
  List, ListItem, ListItemText, Paper, Divider, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText 
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CellTowerIcon from '@mui/icons-material/CellTower';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import type { Conexao } from "../repositories/ConexaoRepository";

export function ConexoesTab() {
  const { user } = useAuth();
  const { mapError } = useFirestoreError();
  const [nomeConexao, setNomeConexao] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [conexaoAlvo, setConexaoAlvo] = useState<Conexao | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = ConexaoRepository.listarPorCliente(user.uid, (lista) => {
      setConexoes(lista);
      setLoadingList(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateConexao = async (e: FormEvent) => {
    e.preventDefault();
    if (!nomeConexao.trim() || !user) return;
    setLoadingAdd(true); setError(""); setSuccess("");
    try {
      await ConexaoRepository.criar(nomeConexao, user.uid);
      setNomeConexao(""); setSuccess("Conexão criada com sucesso!");
    } catch (err) { setError(mapError(err)); } finally { setLoadingAdd(false); }
  };

  const confirmarDelete = async () => {
    if (!conexaoAlvo) return;
    setLoadingDelete(true);
    try {
      await ConexaoRepository.deletar(conexaoAlvo.id);
      setSuccess("Conexão excluída com sucesso!"); setModalDeleteOpen(false);
    } catch (err) { setError(mapError(err)); } finally { setLoadingDelete(false); setConexaoAlvo(null); }
  };

  const confirmarEdit = async () => {
    if (!conexaoAlvo || !nomeEdit.trim()) return;
    setLoadingEdit(true);
    try {
      await ConexaoRepository.atualizar(conexaoAlvo.id, nomeEdit);
      setSuccess("Conexão atualizada com sucesso!"); setModalEditOpen(false);
    } catch (err) { setError(mapError(err)); } finally { setLoadingEdit(false); setConexaoAlvo(null); }
  };

  return (
    <Box>
      {success && <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert severity="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

      <form onSubmit={handleCreateConexao} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <TextField
          label="Nome da Nova Conexão" variant="outlined" size="small" fullWidth required
          value={nomeConexao} onChange={(e) => setNomeConexao(e.target.value)} disabled={loadingAdd} className="sm:max-w-md"
          slotProps={{ htmlInput: { maxLength: 50, minLength: 2 } }}
        />
        <Button type="submit" variant="contained" color="primary" startIcon={!loadingAdd && <AddIcon />} disabled={loadingAdd || !nomeConexao.trim()} className="h-10">
          {loadingAdd ? <CircularProgress size={24} color="inherit" /> : "Adicionar"}
        </Button>
      </form>

      <Divider className="my-6" />
      <Typography variant="h6" className="mb-4 font-semibold text-gray-700">Minhas Conexões ({conexoes.length})</Typography>

      {loadingList ? (
        <div className="flex h-32 items-center justify-center"><CircularProgress /></div>
      ) : conexoes.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50"><span className="text-gray-400">Nenhuma conexão registrada.</span></div>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {conexoes.map((conexao, index) => (
              <motion.div
                key={conexao.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ListItem className="py-3 hover:bg-gray-50" secondaryAction={
                  <div className="flex gap-1">
                    <IconButton onClick={() => { setConexaoAlvo(conexao); setNomeEdit(conexao.nome); setModalEditOpen(true); }}><EditIcon className="text-blue-600" /></IconButton>
                    <IconButton onClick={() => { setConexaoAlvo(conexao); setModalDeleteOpen(true); }}><DeleteIcon className="text-red-500" /></IconButton>
                  </div>
                }>
                  <CellTowerIcon className="mr-3 text-blue-500" />
                  <ListItemText primary={<span className="font-medium text-gray-800">{conexao.nome}</span>} secondary={`ID: ${conexao.id}`} />
                </ListItem>
                {index < conexoes.length - 1 && <Divider />}
              </motion.div>
            ))}
          </List>
        </Paper>
      )}

      {/* Modais de Exclusão e Edição */}
      <Dialog open={modalDeleteOpen} onClose={() => setModalDeleteOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir <strong>{conexaoAlvo?.nome}</strong>?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDeleteOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={confirmarDelete} color="error" variant="contained" disabled={loadingDelete}>Excluir</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditOpen} onClose={() => setModalEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Conexão</DialogTitle>
        <DialogContent><TextField autoFocus margin="dense" label="Nome" fullWidth value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} slotProps={{ htmlInput: { maxLength: 50, minLength: 2 } }}/></DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEditOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={confirmarEdit} color="primary" variant="contained" disabled={loadingEdit || !nomeEdit.trim()}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
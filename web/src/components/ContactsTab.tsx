import { useState, type FormEvent, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
    Typography, Button, Box, TextField, Alert, CircularProgress,
    List, ListItem, ListItemText, Paper, Divider, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Contato {
    id: string;
    nome: string;
    telefone: string;
    clientId: string;
}

export function ContatosTab() {
    const { user } = useAuth();

    // Estados do formulário de criação
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Estados da listagem
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    // Estados de modificação
    const [contatoAlvo, setContatoAlvo] = useState<Contato | null>(null);
    const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [nomeEdit, setNomeEdit] = useState("");
    const [telefoneEdit, setTelefoneEdit] = useState("");
    const [loadingEdit, setLoadingEdit] = useState(false);

    // Escuta os contatos em tempo real filtrados por este cliente
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "contatos"),
            where("clientId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const lista: Contato[] = [];
            querySnapshot.forEach((doc) => {
                lista.push({ id: doc.id, ...doc.data() } as Contato);
            });
            setContatos(lista);
            setLoadingList(false);
        }, (err) => {
            console.error("Erro ao carregar contatos:", err);
            setLoadingList(false);
        });

        return () => unsubscribe();
    }, [user]);

    // CREATE
    const handleCreateContato = async (e: FormEvent) => {
        e.preventDefault();
        if (!nome.trim() || !telefone.trim() || !user) return;

        setLoadingAdd(true); setError(""); setSuccess("");

        try {
            await addDoc(collection(db, "contatos"), {
                nome: nome.trim(),
                telefone: telefone.trim(),
                clientId: user.uid,
                createdAt: new Date()
            });
            setNome("");
            setTelefone("");
            setSuccess("Contato salvo com sucesso!");
        } catch {
            setError("Erro ao salvar contato.");
        } finally {
            setLoadingAdd(false);
        }
    };

    // DELETE
    const confirmarDelete = async () => {
        if (!contatoAlvo) return;
        setLoadingDelete(true);
        try {
            await deleteDoc(doc(db, "contatos", contatoAlvo.id));
            setSuccess("Contato excluído com sucesso!");
            setModalDeleteOpen(false);
        } catch {
            setError("Erro ao excluir contato.");
        } finally {
            setLoadingDelete(false);
            setContatoAlvo(null);
        }
    };

    // UPDATE
    const confirmarEdit = async () => {
        if (!contatoAlvo || !nomeEdit.trim() || !telefoneEdit.trim()) return;
        setLoadingEdit(true);
        try {
            await updateDoc(doc(db, "contatos", contatoAlvo.id), {
                nome: nomeEdit.trim(),
                telefone: telefoneEdit.trim()
            });
            setSuccess("Contato atualizado com sucesso!");
            setModalEditOpen(false);
        } catch {
            setError("Erro ao atualizar contato.");
        } finally {
            setLoadingEdit(false);
            setContatoAlvo(null);
        }
    };

    return (
        <Box>
            {success && <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>{success}</Alert>}
            {error && <Alert severity="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}

            {/* Formulário de Criação */}
            {/* Formulário de Criação Corrigido */}
            <form onSubmit={handleCreateContato} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <TextField
                    label="Nome do Contato" variant="outlined" size="small" fullWidth required
                    value={nome} onChange={(e) => setNome(e.target.value)} disabled={loadingAdd}
                    slotProps={{ htmlInput: { maxLength: 50, minLength: 2 } }}
                />
                <TextField
                    label="Telefone (ex: 51999999999)" variant="outlined" size="small" fullWidth required
                    value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={loadingAdd}
                    slotProps={{ htmlInput: { maxLength: 20 } }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={!loadingAdd && <AddIcon />}
                    disabled={loadingAdd || !nome.trim() || !telefone.trim()}
                    className="h-10 shrink-0 px-6" // <-- O 'shrink-0' impede o esmagamento do botão
                >
                    Adicionar
                </Button>
            </form>

            <Divider className="my-6" />
            <Typography variant="h6" className="mb-4 font-semibold text-gray-700">Meus Contatos ({contatos.length})</Typography>

            {loadingList ? (
                <div className="flex h-32 items-center justify-center"><CircularProgress /></div>
            ) : contatos.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50"><span className="text-gray-400">Nenhum contato cadastrado.</span></div>
            ) : (
                <Paper variant="outlined">
                    <List disablePadding>
                        {contatos.map((contato, index) => (
                            <div key={contato.id}>
                                <ListItem className="py-3 hover:bg-gray-50" secondaryAction={
                                    <div className="flex gap-1">
                                        <IconButton onClick={() => { setContatoAlvo(contato); setNomeEdit(contato.nome); setTelefoneEdit(contato.telefone); setModalEditOpen(true); }}><EditIcon className="text-blue-600" /></IconButton>
                                        <IconButton onClick={() => { setContatoAlvo(contato); setModalDeleteOpen(true); }}><DeleteIcon className="text-red-500" /></IconButton>
                                    </div>
                                }>
                                    <PersonIcon className="mr-3 text-green-500" />
                                    <ListItemText primary={<span className="font-medium text-gray-800">{contato.nome}</span>} secondary={`Tel: ${contato.telefone} | ID: ${contato.id}`} />
                                </ListItem>
                                {index < contatos.length - 1 && <Divider />}
                            </div>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Modal Deletar */}
            <Dialog open={modalDeleteOpen} onClose={() => setModalDeleteOpen(false)}>
                <DialogTitle>Excluir Contato</DialogTitle>
                <DialogContent><DialogContentText>Deseja mesmo excluir o contato <strong>{contatoAlvo?.nome}</strong>?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalDeleteOpen(false)} color="inherit">Cancelar</Button>
                    <Button onClick={confirmarDelete} color="error" variant="contained" disabled={loadingDelete}>Excluir</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={modalEditOpen} onClose={() => setModalEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Editar Contato</DialogTitle>
                <DialogContent className="flex flex-col gap-4 pt-2">
                    <TextField margin="dense" label="Nome" fullWidth value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} slotProps={{ htmlInput: { maxLength: 50, minLength: 2 } }} />
                    <TextField margin="dense" label="Telefone" fullWidth value={telefoneEdit} onChange={(e) => setTelefoneEdit(e.target.value)} slotProps={{ htmlInput: { maxLength: 20 } }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalEditOpen(false)} color="inherit">Cancelar</Button>
                    <Button onClick={confirmarEdit} color="primary" variant="contained" disabled={loadingEdit || !nomeEdit.trim() || !telefoneEdit.trim()}>Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  TextField, 
  Alert, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import CellTowerIcon from '@mui/icons-material/CellTower';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Conexao {
  id: string;
  nome: string;
  clientId: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principais
  const [nomeConexao, setNomeConexao] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Estados para os Modais de Edição e Exclusão
  const [conexaoAlvo, setConexaoAlvo] = useState<Conexao | null>(null);
  
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  // Efeito para buscar os dados em tempo real
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conexoes"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista: Conexao[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as Conexao);
      });
      setConexoes(lista);
      setLoadingList(false);
    }, (err) => {
      console.error("Erro ao escutar conexões:", err);
      setLoadingList(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Função para CRIAR (Create)
  const handleCreateConexao = async (e: FormEvent) => {
    e.preventDefault();
    if (!nomeConexao.trim() || !user) return;
    setLoadingAdd(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "conexoes"), {
        nome: nomeConexao.trim(),
        clientId: user.uid,
        createdAt: new Date()
      });
      setNomeConexao("");
      setSuccess("Conexão criada com sucesso!");
    } catch (err) {
      setError("Erro ao criar conexão.");
    } finally {
      setLoadingAdd(false);
    }
  };

  // Funções para EXCLUIR (Delete)
  const abrirModalDelete = (conexao: Conexao) => {
    setConexaoAlvo(conexao);
    setModalDeleteOpen(true);
  };

  const confirmarDelete = async () => {
    if (!conexaoAlvo) return;
    setLoadingDelete(true);
    try {
      // doc() cria a referência exata daquele documento no banco para ser excluído
      await deleteDoc(doc(db, "conexoes", conexaoAlvo.id));
      setSuccess("Conexão excluída com sucesso!");
      setModalDeleteOpen(false);
    } catch (err) {
      setError("Erro ao excluir a conexão.");
    } finally {
      setLoadingDelete(false);
      setConexaoAlvo(null);
    }
  };

  // Funções para EDITAR (Update)
  const abrirModalEdit = (conexao: Conexao) => {
    setConexaoAlvo(conexao);
    setNomeEdit(conexao.nome); // Preenche o input do modal com o nome atual
    setModalEditOpen(true);
  };

  const confirmarEdit = async () => {
    if (!conexaoAlvo || !nomeEdit.trim()) return;
    setLoadingEdit(true);
    try {
      // updateDoc altera apenas os campos especificados do documento
      await updateDoc(doc(db, "conexoes", conexaoAlvo.id), {
        nome: nomeEdit.trim()
      });
      setSuccess("Conexão atualizada com sucesso!");
      setModalEditOpen(false);
    } catch (err) {
      setError("Erro ao atualizar a conexão.");
    } finally {
      setLoadingEdit(false);
      setConexaoAlvo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Broadcast SaaS
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }} className="hidden sm:block">
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="mt-8">
        <Box className="rounded-lg bg-white p-6 shadow-sm">
          <Typography variant="h4" className="mb-6 font-bold text-gray-800">
            Painel de Conexões
          </Typography>

          {success && (
            <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" className="mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleCreateConexao} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <TextField
              label="Nome da Nova Conexão"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={nomeConexao}
              onChange={(e) => setNomeConexao(e.target.value)}
              disabled={loadingAdd}
              className="sm:max-w-md"
              slotProps={{ htmlInput: { maxLength: 50, minLength: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={!loadingAdd && <AddIcon />}
              disabled={loadingAdd || !nomeConexao.trim()}
              className="h-10"
            >
              {loadingAdd ? <CircularProgress size={24} color="inherit" /> : "Adicionar"}
            </Button>
          </form>

          <Divider className="my-6" />

          <Typography variant="h6" className="mb-4 font-semibold text-gray-700">
            Minhas Conexões ({conexoes.length})
          </Typography>

          {loadingList ? (
            <div className="flex h-32 items-center justify-center">
              <CircularProgress />
            </div>
          ) : conexoes.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50">
              <span className="text-gray-400">Nenhuma conexão registrada.</span>
            </div>
          ) : (
            <Paper variant="outlined">
              <List disablePadding>
                {conexoes.map((conexao, index) => (
                  <div key={conexao.id}>
                    <ListItem 
                      className="py-3 hover:bg-gray-50"
                      secondaryAction={
                        <div className="flex gap-1">
                          <IconButton onClick={() => abrirModalEdit(conexao)} disabled={loadingEdit || loadingDelete}>
                            <EditIcon className="text-blue-600" />
                          </IconButton>
                          <IconButton onClick={() => abrirModalDelete(conexao)} disabled={loadingEdit || loadingDelete}>
                            <DeleteIcon className="text-red-500" />
                          </IconButton>
                        </div>
                      }
                    >
                      <CellTowerIcon className="mr-3 text-blue-500" />
                      <ListItemText 
                        primary={<span className="font-medium text-gray-800">{conexao.nome}</span>} 
                        secondary={`ID: ${conexao.id}`}
                      />
                    </ListItem>
                    {index < conexoes.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            </Paper>
          )}

        </Box>
      </Container>

      {/* Modal de Exclusão */}
      <Dialog open={modalDeleteOpen} onClose={() => setModalDeleteOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a conexão <strong>{conexaoAlvo?.nome}</strong>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDeleteOpen(false)} color="inherit" disabled={loadingDelete}>
            Cancelar
          </Button>
          <Button onClick={confirmarDelete} color="error" variant="contained" disabled={loadingDelete}>
            {loadingDelete ? <CircularProgress size={24} color="inherit" /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={modalEditOpen} onClose={() => setModalEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Conexão</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Conexão"
            type="text"
            fullWidth
            variant="outlined"
            value={nomeEdit}
            onChange={(e) => setNomeEdit(e.target.value)}
            disabled={loadingEdit}
            slotProps={{ htmlInput: { maxLength: 50, minLength: 2 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEditOpen(false)} color="inherit" disabled={loadingEdit}>
            Cancelar
          </Button>
          <Button onClick={confirmarEdit} color="primary" variant="contained" disabled={loadingEdit || !nomeEdit.trim()}>
            {loadingEdit ? <CircularProgress size={24} color="inherit" /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
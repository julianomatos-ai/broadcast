✅ FASE 1: Estrutura e Arquitetura (CONCLUÍDO)
[x] React + TypeScript + Vite: Projeto criado e configurado (sem usar React Scripts).

[x] Separação de Pastas: Frontend isolado na pasta web e backend na pasta functions.

[x] Estilização: Tailwind CSS configurado para layout e Material UI para componentes.

[x] Paradigma Funcional e Código Limpo: Uso de Hooks (useState, useEffect), Context API e separação de responsabilidades.

[x] Conexão com Firebase: firebaseConfig operando perfeitamente.

✅ FASE 2: Autenticação e Multi-Tenant (CONCLUÍDO)
[x] Login e Cadastro: Telas criadas e funcionando com Firebase Auth.

[x] Isolamento de Dados (SaaS): Estratégia de clientId (usando o uid do usuário) definida para proteger o acesso.

[x] Guardião de Rotas: Implementação do <ProtectedRoute> para bloquear usuários não logados.

⏳ FASE 3: O CRUD de Conexões (EM ANDAMENTO)
[x] Estrutura sem Subcoleções: Gravando direto na raiz do Firestore (conexoes).

[x] Tempo Real: Leitura (Read) utilizando onSnapshot.

[x] Criar (Create): Formulário adicionando a conexão no banco com sucesso.

[ ] Editar (Update): Criar a função para alterar o nome de uma conexão.

[ ] Excluir (Delete): Criar a função para remover uma conexão da lista.

⏳ FASE 4: O CRUD de Contatos (PENDENTE)
[ ] Interface: Criar a tela/área de Contatos.

[ ] Criar (Create): Salvar contatos (com nome, telefone e clientId) no Firestore.

[ ] Ler (Read): Listar contatos em tempo real.

[ ] Editar (Update): Alterar dados do contato.

[ ] Excluir (Delete): Remover contato.

⏳ FASE 5: Mensagens e Agendamentos (PENDENTE)
[ ] Interface de Envio: Tela para selecionar um ou mais contatos específicos.

[ ] Criar/Agendar: Salvar a mensagem no banco (com status "enviada" ou "agendada", vinculada ao clientId).

[ ] Ler e Filtrar: Listagem em tempo real das mensagens com filtro visual por status (Enviada/Agendada).

[ ] Editar/Excluir: Opções de gerir essas mensagens.

⏳ FASE 6: Backend / Firebase Functions (PENDENTE)
[ ] O Disparo (Fake): Criar a Scheduled Function (Cloud Scheduler) na pasta functions.

[ ] Lógica da Função: Fazer o Node.js buscar as mensagens "agendadas" cujo horário já bateu e alterar o status no Firestore para "enviado".

⏳ FASE 7: Entrega Final (PENDENTE)
[ ] Regras de Segurança: Configurar o firestore.rules para travar tudo com base no request.auth.uid.

[ ] Deploy: Rodar firebase deploy --only hosting para colocar o Vite no ar.

[ ] Deploy Functions: Rodar firebase deploy --only functions para subir o backend.

[ ] Formulário: Enviar o link para a empresa.
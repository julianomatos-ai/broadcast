import { query, where, collection, onSnapshot, orderBy, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { type Unsubscribe } from '@firebase/firestore';

export interface Mensagem {
  id: string;
  contatoId: string;
  contatoNome: string;
  texto: string;
  status: 'enviada' | 'agendada';
  dataAgendamento: string | null;
  clientId: string;
  createdAt?: Date;
}

export class MensagemRepository {
  static listarPorCliente(clientId: string, callback: (mensagens: Mensagem[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'mensagens'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const mensagens = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mensagem[];
      callback(mensagens);
    }, (err) => {
      console.error('Erro ao carregar mensagens:', err);
    });
  }

  static async criar(
    contatoId: string,
    contatoNome: string,
    texto: string,
    status: 'enviada' | 'agendada',
    dataAgendamento: string | null,
    clientId: string
  ): Promise<void> {
    await addDoc(collection(db, 'mensagens'), {
      contatoId,
      contatoNome,
      texto: texto.trim(),
      status,
      dataAgendamento,
      clientId,
      createdAt: new Date()
    });
  }

  static async deletar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'mensagens', id));
  }
}

import { query, where, collection, onSnapshot, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { type Unsubscribe } from '@firebase/firestore';

export interface Contato {
  id: string;
  nome: string;
  telefone: string;
  clientId: string;
  createdAt?: Date;
}

export class ContatoRepository {
  static listarPorCliente(clientId: string, callback: (contatos: Contato[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'contatos'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const contatos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contato[];
      callback(contatos);
    }, (err) => {
      console.error('Erro ao carregar contatos:', err);
    });
  }

  static async criar(nome: string, telefone: string, clientId: string): Promise<void> {
    await addDoc(collection(db, 'contatos'), {
      nome: nome.trim(),
      telefone: telefone.trim(),
      clientId,
      createdAt: new Date()
    });
  }

  static async atualizar(id: string, nome: string, telefone: string): Promise<void> {
    await updateDoc(doc(db, 'contatos', id), {
      nome: nome.trim(),
      telefone: telefone.trim()
    });
  }

  static async deletar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'contatos', id));
  }
}

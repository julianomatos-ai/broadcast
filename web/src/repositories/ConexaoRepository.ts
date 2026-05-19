import { query, where, collection, onSnapshot, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { type Unsubscribe } from '@firebase/firestore';

export interface Conexao {
  id: string;
  nome: string;
  clientId: string;
  createdAt?: Date;
}

export class ConexaoRepository {
  static listarPorCliente(clientId: string, callback: (conexoes: Conexao[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'conexoes'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const conexoes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conexao[];
      callback(conexoes);
    });
  }

  static async criar(nome: string, clientId: string): Promise<void> {
    await addDoc(collection(db, 'conexoes'), {
      nome: nome.trim(),
      clientId,
      createdAt: new Date()
    });
  }

  static async atualizar(id: string, nome: string): Promise<void> {
    await updateDoc(doc(db, 'conexoes', id), { nome: nome.trim() });
  }

  static async deletar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'conexoes', id));
  }
}

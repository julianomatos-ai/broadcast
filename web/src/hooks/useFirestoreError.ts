import { FirebaseError } from 'firebase/app';

export function useFirestoreError() {
  const mapError = (err: unknown): string => {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case 'permission-denied':
          return 'Você não tem permissão para esta ação.';
        case 'not-found':
          return 'Documento não encontrado.';
        case 'deadline-exceeded':
          return 'Operação expirou. Tente novamente.';
        case 'unavailable':
          return 'Serviço temporariamente indisponível. Tente novamente.';
        case 'already-exists':
          return 'Este registro já existe.';
        case 'invalid-argument':
          return 'Argumento inválido fornecido.';
        case 'failed-precondition':
          return 'Operação falhou devido a pré-condições não atendidas.';
        case 'aborted':
          return 'Operação foi abortada.';
        default:
          return `Erro: ${err.message || 'Erro desconhecido ao processar requisição.'}`;
      }
    }
    if (err instanceof Error) {
      return `Erro: ${err.message}`;
    }
    return 'Erro ao processar requisição. Tente novamente.';
  };
  
  return { mapError };
}

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser } from '@/integration/authIntegration';
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
 
type AuthContextData = {
  isAuthenticated: boolean;
  user: string | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
};
 
// ─── Contexto ─────────────────────────────────────────────────────────────────
 
const AuthContext = createContext<AuthContextData | undefined>(undefined);
 
// ─── Helper: gera 5 IDs únicos aleatórios entre 1 e 151 ──────────────────────
 
function generateRandomTeamIds(): number[] {
  const ids = new Set<number>();
  while (ids.size < 5) {
    ids.add(Math.floor(Math.random() * 151) + 1);
  }
  return Array.from(ids);
}
 
// ─── Helper: garante que o usuário tem time salvo no AsyncStorage ─────────────
 
async function ensureTeamInStorage(userId: string): Promise<void> {
  const key = `@Team:${userId}`;
  const existing = await AsyncStorage.getItem(key);
  if (!existing) {
    // Primeiro login deste usuário — cria time aleatório e salva
    const randomIds = generateRandomTeamIds();
    await AsyncStorage.setItem(key, JSON.stringify(randomIds));
  }
}
 
// ─── Provider ─────────────────────────────────────────────────────────────────
 
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  // ── Restaura sessão ao abrir o app ──────────────────────────────────────────
  useEffect(() => {
    async function loadStorageData() {
      // A API não retorna token — a sessão é identificada só por user + userId.
      const storedUser   = await AsyncStorage.getItem('@Auth:user');
      const storedUserId = await AsyncStorage.getItem('@Auth:userId');
 
      if (storedUser && storedUserId) {
        setUser(storedUser);
        setUserId(storedUserId);
        setIsAuthenticated(true);
      }
 
      setIsLoading(false);
    }
    loadStorageData();
  }, []);
 
  // ── Login ───────────────────────────────────────────────────────────────────
  async function signIn(username: string, password: string): Promise<boolean> {
    try {
      const data = await loginUser(username, password);
 
      // A API retorna só { userId } — sem token. Salvamos user + userId.
      await AsyncStorage.multiSet([
        ['@Auth:userId', data.userId],
        ['@Auth:user',   username],
      ]);
 
      // Garante que este usuário tem um time salvo (só cria se for a 1ª vez)
      await ensureTeamInStorage(data.userId);
 
      setUser(username);
      setUserId(data.userId);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      // Distingue erro de rede (sem resposta) de credenciais inválidas (4xx).
      // Isso evita mostrar "credenciais inválidas" quando o problema é de rede
      // (ex: cold start do Android, timeout, sem conexão).
      if (__DEV__) {
        console.warn('[AuthContext] signIn erro:', error?.message, 'status:', error?.response?.status);
      }
      return false;
    }
  }
 
  // ── Cadastro ────────────────────────────────────────────────────────────────
  async function signUp(username: string, password: string): Promise<boolean> {
    try {
      await registerUser(username, password);
      return true;
    } catch {
      return false;
    }
  }
 
  // ── Logout ──────────────────────────────────────────────────────────────────
  // O time (@Team:{userId}) e o avatar (@Profile:avatar:{userId}) NÃO são
  // removidos aqui — ficam salvos para quando o usuário logar novamente.
  async function signOut() {
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);
    await AsyncStorage.multiRemove(['@Auth:user', '@Auth:userId']);
  }
 
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, userId, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook de acesso ao contexto ───────────────────────────────────────────────
// Era ESTE export que faltava: sem ele, todo `import { useAuth }` virava
// `undefined` e estourava "(0 , useAuth) is not a function".

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>');
  }
  return context;
}
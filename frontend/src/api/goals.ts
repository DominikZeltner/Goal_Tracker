import axios from 'axios';

// API-Base-URL aus Umgebungsvariable, Fallback auf http://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Axios-Instanz mit Base-URL konfigurieren
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Typen für Ziele
export interface Ziel {
  id: number;
  titel: string;
  beschreibung?: string;
  start_datum: string;
  end_datum: string;
  status: 'offen' | 'in Arbeit' | 'erledigt';
  parent_id?: number;
}

export interface ZielCreate {
  titel: string;
  beschreibung?: string;
  start_datum: string;
  end_datum: string;
  status: 'offen' | 'in Arbeit' | 'erledigt';
  parent_id?: number;
}

export interface ZielUpdate {
  titel?: string;
  beschreibung?: string;
  start_datum?: string;
  end_datum?: string;
  status?: 'offen' | 'in Arbeit' | 'erledigt';
  parent_id?: number;
}

export interface ZielWithChildren extends Ziel {
  children?: ZielWithChildren[];
}

// API-Funktionen
export const getGoals = async (tree: boolean = false): Promise<Ziel[] | ZielWithChildren[]> => {
  const response = await apiClient.get('/ziele', {
    params: tree ? { tree: 1 } : {},
  });
  return response.data;
};

export const getGoal = async (id: number): Promise<Ziel> => {
  const response = await apiClient.get(`/ziele/${id}`);
  return response.data;
};

export const createGoal = async (data: ZielCreate): Promise<Ziel> => {
  const response = await apiClient.post('/ziele', data);
  return response.data;
};

export const updateGoal = async (id: number, data: ZielUpdate): Promise<Ziel> => {
  const response = await apiClient.put(`/ziele/${id}`, data);
  return response.data;
};

export const updateStatus = async (id: number, status: 'offen' | 'in Arbeit' | 'erledigt'): Promise<Ziel> => {
  const response = await apiClient.patch(`/ziele/${id}`, { status });
  return response.data;
};

export const deleteGoal = async (id: number): Promise<void> => {
  await apiClient.delete(`/ziele/${id}`);
};

// Export der API-Base-URL für Debugging
export const getApiBaseUrl = (): string => API_BASE_URL;

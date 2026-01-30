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

export interface ZielHistory {
  id: number;
  ziel_id: number;
  changed_at: string;  // ISO datetime string
  change_type: string;  // 'created', 'updated', 'status_changed', 'deleted', 'comment_added'
  field_name?: string;
  old_value?: string;
  new_value?: string;
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

// Lädt ein Ziel mit allen Unterzielen (hierarchisch)
export const getGoalWithChildren = async (id: number): Promise<ZielWithChildren> => {
  // Lade alle Ziele hierarchisch
  const allGoals = (await getGoals(true)) as ZielWithChildren[];
  
  // Finde das gewünschte Ziel in der Hierarchie
  const findGoal = (goals: ZielWithChildren[], targetId: number): ZielWithChildren | null => {
    for (const goal of goals) {
      if (goal.id === targetId) return goal;
      if (goal.children) {
        const found = findGoal(goal.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  
  const goal = findGoal(allGoals, id);
  if (!goal) {
    throw new Error('Ziel nicht gefunden');
  }
  
  return goal;
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

export const deleteGoal = async (id: number, cascade: boolean = false): Promise<void> => {
  await apiClient.delete(`/ziele/${id}`, {
    params: { cascade },
  });
};

export const getGoalHistory = async (id: number): Promise<ZielHistory[]> => {
  const response = await apiClient.get(`/ziele/${id}/history`);
  return response.data;
};

// ===== KOMMENTAR-FUNKTIONEN =====

export interface Kommentar {
  id: number;
  ziel_id: number;
  created_at: string;  // ISO datetime string
  content: string;
}

export interface KommentarCreate {
  content: string;
}

export const getKommentare = async (zielId: number): Promise<Kommentar[]> => {
  const response = await apiClient.get(`/ziele/${zielId}/kommentare`);
  return response.data;
};

export const createKommentar = async (zielId: number, data: KommentarCreate): Promise<Kommentar> => {
  const response = await apiClient.post(`/ziele/${zielId}/kommentare`, data);
  return response.data;
};

export const deleteKommentar = async (kommentarId: number): Promise<void> => {
  await apiClient.delete(`/kommentare/${kommentarId}`);
};

// Export der API-Base-URL für Debugging
export const getApiBaseUrl = (): string => API_BASE_URL;

import { ZielWithChildren } from '../api/goals';

/**
 * Berechnet den Fortschritt eines Ziels basierend auf seinen Unterzielen
 * 
 * Logik:
 * - Wenn keine Unterziele: Fortschritt basiert auf eigenem Status
 *   - erledigt: 100%
 *   - in Arbeit: 50%
 *   - offen: 0%
 * - Wenn Unterziele: Durchschnitt aller Unterziele (rekursiv)
 */
export function calculateProgress(goal: ZielWithChildren | null): number {
  if (!goal) return 0;

  // Wenn keine Kinder, basierend auf eigenem Status
  if (!goal.children || goal.children.length === 0) {
    if (goal.status === 'erledigt') return 100;
    if (goal.status === 'in Arbeit') return 50;
    return 0;
  }

  // Mit Kindern: Durchschnittlicher Fortschritt aller Kinder
  const totalProgress = goal.children.reduce((sum, child) => {
    return sum + calculateProgress(child);
  }, 0);

  return totalProgress / goal.children.length;
}

/**
 * Zählt die Anzahl erledigter Unterziele
 */
export function countCompletedChildren(goal: ZielWithChildren | null): { completed: number; total: number } {
  if (!goal || !goal.children || goal.children.length === 0) {
    return { completed: 0, total: 0 };
  }

  const completed = goal.children.filter(child => child.status === 'erledigt').length;
  return { completed, total: goal.children.length };
}

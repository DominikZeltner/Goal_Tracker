import { useEffect, useState } from 'react';
import { getGoals } from '../api/goals';

export default function Timeline() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test der getGoals-Funktion
    const loadGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGoals(false);
        setGoals(Array.isArray(data) ? data : []);
        console.log('Ziele geladen:', data);
      } catch (err: any) {
        console.error('Fehler beim Laden der Ziele:', err);
        setError(err.message || 'Fehler beim Laden der Ziele');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Timeline</h2>
      {loading && <p className="text-gray-600">Lade Ziele...</p>}
      {error && (
        <p className="text-red-600">
          Fehler: {error}
          <br />
          <span className="text-sm text-gray-500">
            Stelle sicher, dass das Backend auf http://localhost:8000 läuft.
          </span>
        </p>
      )}
      {!loading && !error && (
        <>
          <p className="text-gray-600 mb-4">
            Hier wird die Timeline-Ansicht mit vis-timeline angezeigt werden.
          </p>
          <p className="text-sm text-gray-500">
            Anzahl geladener Ziele: {goals.length}
          </p>
        </>
      )}
    </div>
  );
}

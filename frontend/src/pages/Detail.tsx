import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGoal, Ziel } from '../api/goals';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [goal, setGoal] = useState<Ziel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadGoal = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGoal(parseInt(id));
        setGoal(data);
        console.log('Ziel geladen:', data);
      } catch (err: any) {
        console.error('Fehler beim Laden des Ziels:', err);
        setError(err.message || 'Fehler beim Laden des Ziels');
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [id]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Ziel-Detail {id}
      </h2>
      {loading && <p className="text-gray-600">Lade Ziel...</p>}
      {error && (
        <p className="text-red-600">
          Fehler: {error}
          <br />
          <span className="text-sm text-gray-500">
            Stelle sicher, dass das Backend auf http://localhost:8000 läuft.
          </span>
        </p>
      )}
      {!loading && !error && goal && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{goal.titel}</h3>
          {goal.beschreibung && (
            <p className="text-gray-600 mb-2">{goal.beschreibung}</p>
          )}
          <p className="text-sm text-gray-500">
            Status: {goal.status} | Von {goal.start_datum} bis {goal.end_datum}
          </p>
        </div>
      )}
      {!loading && !error && !goal && (
        <p className="text-gray-600">
          Hier werden die Details des Ziels mit der ID {id} angezeigt werden.
        </p>
      )}
    </div>
  );
}

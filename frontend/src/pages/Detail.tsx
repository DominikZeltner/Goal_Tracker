import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGoalWithChildren, updateStatus, ZielWithChildren } from '../api/goals';
import ProgressBar from '../components/ProgressBar';
import { calculateProgress, countCompletedChildren } from '../utils/progress';
import { formatToSwiss, daysUntilText } from '../utils/dateFormat';

// Status-Farben
const STATUS_COLORS = {
  'offen': 'bg-gray-100 text-gray-800 border-gray-300',
  'in Arbeit': 'bg-blue-100 text-blue-800 border-blue-300',
  'erledigt': 'bg-green-100 text-green-800 border-green-300',
};

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<ZielWithChildren | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ziel laden (mit Unterzielen für Fortschritts-Berechnung)
  const loadGoal = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getGoalWithChildren(parseInt(id));
      setGoal(data);
      console.log('Ziel mit Unterzielen geladen:', data);
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Laden des Ziels:', error);
      setError(error.message || 'Fehler beim Laden des Ziels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Status auf "erledigt" setzen (Abhaken)
  const handleComplete = async () => {
    if (!id || !goal) return;

    setUpdating(true);
    setError(null);
    try {
      const updatedGoal = await updateStatus(parseInt(id), 'erledigt');
      setGoal(updatedGoal);
      console.log('Status aktualisiert:', updatedGoal);
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Aktualisieren des Status:', error);
      setError(error.message || 'Fehler beim Aktualisieren des Status');
    } finally {
      setUpdating(false);
    }
  };

  // Status-Wechsel (offen → in Arbeit → erledigt)
  const handleStatusChange = async (newStatus: 'offen' | 'in Arbeit' | 'erledigt') => {
    if (!id || !goal) return;

    setUpdating(true);
    setError(null);
    try {
      const updatedGoal = await updateStatus(parseInt(id), newStatus);
      setGoal(updatedGoal);
      console.log('Status aktualisiert:', updatedGoal);
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Aktualisieren des Status:', error);
      setError(error.message || 'Fehler beim Aktualisieren des Status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Lade Ziel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">
            Fehler: {error}
            <br />
            <span className="text-sm text-gray-500">
              Stelle sicher, dass das Backend auf http://localhost:8000 läuft.
            </span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          ← Zurück
        </button>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Ziel nicht gefunden.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          ← Zurück
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header mit Zurück-Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
        >
          ← Zurück
        </button>
        <h2 className="text-3xl font-bold text-gray-900">{goal.titel}</h2>
      </div>

      {/* Status-Badge */}
      <div className="mb-6">
        <span
          className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
            STATUS_COLORS[goal.status] || STATUS_COLORS.offen
          }`}
        >
          {goal.status}
        </span>
      </div>

      {/* Beschreibung */}
      {goal.beschreibung && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Beschreibung</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{goal.beschreibung}</p>
        </div>
      )}

      {/* Zeitraum */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Start</h3>
          <p className="text-gray-700">{formatToSwiss(goal.start_datum)}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Ende</h3>
          <p className="text-gray-700">{formatToSwiss(goal.end_datum)}</p>
          <p className="text-sm text-gray-500 mt-1">{daysUntilText(goal.end_datum)}</p>
        </div>
      </div>

      {/* Fortschritt */}
      {goal.children && goal.children.length > 0 && (
        <div className="mb-6">
          <ProgressBar progress={calculateProgress(goal)} />
          <p className="text-sm text-gray-600 mt-2">
            {countCompletedChildren(goal).completed} von {countCompletedChildren(goal).total} Unterzielen erledigt
          </p>
        </div>
      )}

      {/* Unterziele */}
      {goal.children && goal.children.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Unterziele</h3>
          <ul className="space-y-2" role="list" aria-label="Liste der Unterziele">
            {goal.children.map((child) => (
              <li key={child.id}>
                <Link
                  to={`/ziel/${child.id}`}
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  aria-label={`Unterziel: ${child.titel}`}
                >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{child.titel}</h4>
                    {child.beschreibung && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{child.beschreibung}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        child.status === 'erledigt'
                          ? 'bg-green-100 text-green-800'
                          : child.status === 'in Arbeit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {child.status}
                    </span>
                  </div>
                </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Übergeordnetes Ziel */}
      {goal.parent_id && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Übergeordnetes Ziel</h3>
          <Link
            to={`/ziel/${goal.parent_id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Ziel #{goal.parent_id} anzeigen →
          </Link>
        </div>
      )}

      {/* Aktionen */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktionen</h3>
        <div className="flex flex-wrap gap-3">
          {/* Bearbeiten-Button */}
          <Link
            to={`/ziel/${goal.id}/bearbeiten`}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            aria-label="Ziel bearbeiten"
          >
            ✏️ Bearbeiten
          </Link>

          {/* Abhaken-Button (nur wenn nicht erledigt) */}
          {goal.status !== 'erledigt' && (
            <button
              onClick={handleComplete}
              disabled={updating}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              aria-label="Ziel als erledigt markieren"
              aria-disabled={updating}
            >
              {updating ? (
                <>⏳ Aktualisiere...</>
              ) : (
                <>✓ Als erledigt markieren</>
              )}
            </button>
          )}

          {/* Status-Wechsel Buttons */}
          {goal.status === 'offen' && (
            <button
              onClick={() => handleStatusChange('in Arbeit')}
              disabled={updating}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              aria-label="Ziel in Arbeit nehmen"
            >
              In Arbeit nehmen
            </button>
          )}

          {goal.status === 'in Arbeit' && (
            <button
              onClick={() => handleStatusChange('offen')}
              disabled={updating}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              Zurück zu Offen
            </button>
          )}

          {goal.status === 'erledigt' && (
            <button
              onClick={() => handleStatusChange('offen')}
              disabled={updating}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              Wieder öffnen
            </button>
          )}
        </div>
      </div>

      {/* Erfolgs-Meldung bei erledigtem Ziel */}
      {goal.status === 'erledigt' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800 font-medium">
            ✓ Dieses Ziel wurde erfolgreich abgeschlossen!
          </p>
        </div>
      )}
    </div>
  );
}

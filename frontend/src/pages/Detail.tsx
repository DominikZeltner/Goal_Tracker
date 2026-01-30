import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGoalWithChildren, updateStatus, deleteGoal, ZielWithChildren } from '../api/goals';
import ProgressBar from '../components/ProgressBar';
import { calculateProgress, countCompletedChildren } from '../utils/progress';
import { formatToSwiss, daysUntilText } from '../utils/dateFormat';
import HistoryTab from '../components/HistoryTab';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'history'>('detail');

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

  // Ziel löschen
  const handleDelete = async (cascade: boolean) => {
    if (!id) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteGoal(parseInt(id), cascade);
      console.log(`Ziel ${id} gelöscht (cascade: ${cascade})`);
      // Zur Timeline navigieren
      navigate('/');
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Löschen des Ziels:', error);
      setError(error.message || 'Fehler beim Löschen des Ziels');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
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
      {/* Header-Zeile 1: Navigation-Buttons */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
        >
          ← Zurück
        </button>
        
        <Link
          to={`/ziel/${goal.id}/bearbeiten`}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
          aria-label="Ziel bearbeiten"
        >
          ✏️ Bearbeiten
        </Link>

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={updating || deleting}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          aria-label="Ziel löschen"
        >
          🗑️ Löschen
        </button>
      </div>

      {/* Header-Zeile 2: Titel + Status + Status-Buttons */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 flex-1">{goal.titel}</h2>
        
        <div className="flex items-center gap-3">
          {/* Status-Badge */}
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
              STATUS_COLORS[goal.status] || STATUS_COLORS.offen
            }`}
          >
            {goal.status}
          </span>

          {/* Status-Wechsel Buttons */}
          {goal.status !== 'erledigt' && (
            <button
              onClick={handleComplete}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Ziel als erledigt markieren"
              aria-disabled={updating}
            >
              {updating ? '⏳ ...' : '✓ Erledigt'}
            </button>
          )}

          {goal.status === 'offen' && (
            <button
              onClick={() => handleStatusChange('in Arbeit')}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              aria-label="Ziel in Arbeit nehmen"
            >
              In Arbeit
            </button>
          )}

          {goal.status === 'in Arbeit' && (
            <button
              onClick={() => handleStatusChange('offen')}
              disabled={updating}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              Zu Offen
            </button>
          )}

          {goal.status === 'erledigt' && (
            <button
              onClick={() => handleStatusChange('offen')}
              disabled={updating}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              Wieder öffnen
            </button>
          )}
        </div>
      </div>

      {/* Tab-Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('detail')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detail'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📜 History
          </button>
        </nav>
      </div>

      {/* Tab-Content: Detail */}
      {activeTab === 'detail' && (
        <>
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

      {/* Erfolgs-Meldung bei erledigtem Ziel */}
      {goal.status === 'erledigt' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800 font-medium">
            ✓ Dieses Ziel wurde erfolgreich abgeschlossen!
          </p>
        </div>
      )}
        </>
      )}

      {/* Tab-Content: History */}
      {activeTab === 'history' && <HistoryTab goalId={parseInt(id!)} />}

      {/* Löschen-Bestätigungs-Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ziel löschen?
            </h3>
            <p className="text-gray-700 mb-6">
              Möchtest du das Ziel <strong>"{goal.titel}"</strong> wirklich löschen?
            </p>

            {/* Warnung bei Unterzielen */}
            {goal.children && goal.children.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <p className="text-yellow-800 text-sm font-medium mb-3">
                  ⚠️ Dieses Ziel hat {goal.children.length} Unterziel{goal.children.length > 1 ? 'e' : ''}.
                </p>
                <p className="text-gray-700 text-sm mb-3">
                  Was soll gelöscht werden?
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDelete(false)}
                    disabled={deleting}
                    className="w-full px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? '⏳ Lösche...' : 'Nur dieses Ziel löschen'}
                  </button>
                  <button
                    onClick={() => handleDelete(true)}
                    disabled={deleting}
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? '⏳ Lösche...' : `Ziel + alle ${goal.children.length} Unterziele löschen`}
                  </button>
                </div>
              </div>
            )}

            {/* Buttons wenn keine Unterziele */}
            {(!goal.children || goal.children.length === 0) && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDelete(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? '⏳ Lösche...' : 'Ja, löschen'}
                </button>
              </div>
            )}

            {/* Abbrechen-Button wenn Unterziele vorhanden */}
            {goal.children && goal.children.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="w-full mt-3 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

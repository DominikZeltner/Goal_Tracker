import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGoal, updateGoal, getGoals, Ziel } from '../api/goals';
import { formatForInput, formatFromInput, formatToSwiss } from '../utils/dateFormat';

export default function EditGoal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentGoals, setParentGoals] = useState<Ziel[]>([]);

  // Formular-State
  const [titel, setTitel] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [startDatum, setStartDatum] = useState('');
  const [endDatum, setEndDatum] = useState('');
  const [status, setStatus] = useState<'offen' | 'in Arbeit' | 'erledigt'>('offen');
  const [parentId, setParentId] = useState<number | null>(null);

  // Ziel und Parent-Goals laden
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Ziel laden
        const goalData = await getGoal(parseInt(id));
        setTitel(goalData.titel);
        setBeschreibung(goalData.beschreibung || '');
        setStartDatum(goalData.start_datum);
        setEndDatum(goalData.end_datum);
        setStatus(goalData.status);
        setParentId(goalData.parent_id || null);

        // Parent-Goals laden (für Dropdown)
        const goals = await getGoals(false);
        // Filtere das aktuelle Ziel und seine Unterziele aus (verhindere Zirkel)
        const availableParents = goals.filter((g) => g.id !== goalData.id);
        setParentGoals(availableParents);
      } catch (err) {
        const error = err as Error;
        console.error('Fehler beim Laden:', error);
        setError(error.message || 'Fehler beim Laden des Ziels');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validierung
    if (!titel.trim()) {
      setError('Titel ist erforderlich');
      return;
    }

    if (!startDatum || !endDatum) {
      setError('Start- und Enddatum sind erforderlich');
      return;
    }

    if (new Date(startDatum) > new Date(endDatum)) {
      setError('Startdatum muss vor dem Enddatum liegen');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedGoal = await updateGoal(parseInt(id), {
        titel: titel.trim(),
        beschreibung: beschreibung.trim() || undefined,
        start_datum: formatFromInput(startDatum),
        end_datum: formatFromInput(endDatum),
        status,
        parent_id: parentId || undefined,
      });

      console.log('Ziel aktualisiert:', updatedGoal);
      navigate(`/ziel/${updatedGoal.id}`);
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Aktualisieren:', error);
      setError(error.message || 'Fehler beim Aktualisieren des Ziels');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/ziel/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Lade Ziel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ziel bearbeiten</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-600">Fehler: {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titel */}
          <div>
            <label htmlFor="titel" className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              id="titel"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Bachelorarbeit schreiben"
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label
              htmlFor="beschreibung"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Weitere Details zum Ziel..."
            />
          </div>

          {/* Datum-Felder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDatum" className="block text-sm font-medium text-gray-700 mb-1">
                Startdatum *
              </label>
              <input
                type="date"
                id="startDatum"
                value={formatForInput(startDatum)}
                onChange={(e) => setStartDatum(formatFromInput(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {startDatum && (
                <p className="text-xs text-gray-500 mt-1">{formatToSwiss(startDatum)}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDatum" className="block text-sm font-medium text-gray-700 mb-1">
                Enddatum *
              </label>
              <input
                type="date"
                id="endDatum"
                value={formatForInput(endDatum)}
                onChange={(e) => setEndDatum(formatFromInput(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {endDatum && (
                <p className="text-xs text-gray-500 mt-1">{formatToSwiss(endDatum)}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'offen' | 'in Arbeit' | 'erledigt')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="offen">Offen</option>
              <option value="in Arbeit">In Arbeit</option>
              <option value="erledigt">Erledigt</option>
            </select>
          </div>

          {/* Parent-Ziel */}
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
              Übergeordnetes Ziel
            </label>
            <select
              id="parentId"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Kein übergeordnetes Ziel (Hauptziel)</option>
              {parentGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.titel} ({goal.status})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Optional: Ordne dieses Ziel einem Hauptziel unter
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '💾 Speichere...' : '💾 Änderungen speichern'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

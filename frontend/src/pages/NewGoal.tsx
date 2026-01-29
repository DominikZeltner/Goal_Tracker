import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGoal, getGoals, Ziel } from '../api/goals';

export default function NewGoal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentGoals, setParentGoals] = useState<Ziel[]>([]);

  // Formular-State
  const [titel, setTitel] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [startDatum, setStartDatum] = useState('');
  const [endDatum, setEndDatum] = useState('');
  const [status, setStatus] = useState<'offen' | 'in Arbeit' | 'erledigt'>('offen');
  const [parentId, setParentId] = useState<number | null>(null);

  // Parent-Ziele laden
  useEffect(() => {
    const loadParentGoals = async () => {
      try {
        const data = (await getGoals(false)) as Ziel[];
        setParentGoals(data);
      } catch (err) {
        console.error('Fehler beim Laden der Ziele:', err);
      }
    };
    loadParentGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validierung
    if (!titel.trim()) {
      setError('Titel ist erforderlich');
      return;
    }
    if (!startDatum) {
      setError('Startdatum ist erforderlich');
      return;
    }
    if (!endDatum) {
      setError('Enddatum ist erforderlich');
      return;
    }
    if (new Date(startDatum) > new Date(endDatum)) {
      setError('Startdatum muss vor dem Enddatum liegen');
      return;
    }

    setLoading(true);

    try {
      const newGoal = await createGoal({
        titel: titel.trim(),
        beschreibung: beschreibung.trim() || undefined,
        start_datum: startDatum,
        end_datum: endDatum,
        status,
        parent_id: parentId || undefined,
      });

      // Zur Detail-Ansicht des neuen Ziels navigieren
      navigate(`/ziel/${newGoal.id}`);
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Erstellen des Ziels:', error);
      setError(error.message || 'Fehler beim Erstellen des Ziels');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Zurück zur vorherigen Seite
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Neues Ziel erstellen</h1>
          <p className="text-gray-600">
            Erstelle ein neues Ziel oder Unterziel für deinen Goal Tracker.
          </p>
        </div>

        {/* Fehleranzeige */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-red-800 font-medium">Fehler:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Formular */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titel */}
          <div>
            <label htmlFor="titel" className="block text-sm font-medium text-gray-700 mb-2">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titel"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Website entwickeln"
              required
              aria-required="true"
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label
              htmlFor="beschreibung"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Beschreibung
            </label>
            <textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Beschreibe dein Ziel im Detail..."
            />
          </div>

          {/* Datum-Felder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Startdatum */}
            <div>
              <label
                htmlFor="startDatum"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Startdatum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDatum"
                value={startDatum}
                onChange={(e) => setStartDatum(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>

            {/* Enddatum */}
            <div>
              <label htmlFor="endDatum" className="block text-sm font-medium text-gray-700 mb-2">
                Enddatum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDatum"
                value={endDatum}
                onChange={(e) => setEndDatum(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'offen' | 'in Arbeit' | 'erledigt')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-required="true"
            >
              <option value="offen">Offen</option>
              <option value="in Arbeit">In Arbeit</option>
              <option value="erledigt">Erledigt</option>
            </select>
          </div>

          {/* Parent-Ziel */}
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
              Übergeordnetes Ziel (optional)
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
            <p className="mt-2 text-sm text-gray-500">
              Wähle ein übergeordnetes Ziel aus, um ein Unterziel zu erstellen.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Ziel erstellen"
            >
              {loading ? '⏳ Erstelle Ziel...' : '✓ Ziel erstellen'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
              aria-label="Abbrechen"
            >
              Abbrechen
            </button>
          </div>
        </form>

        {/* Hinweis */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tipp:</strong> Nach dem Erstellen kannst du das Ziel in der Timeline- oder
            Zielbaum-Ansicht per Drag & Drop verschieben und die Hierarchie ändern.
          </p>
        </div>
      </div>
    </div>
  );
}

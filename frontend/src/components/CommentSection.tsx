import { useEffect, useState } from 'react';
import { createKommentar, deleteKommentar, getKommentare, Kommentar } from '../api/goals';
import { formatToSwiss } from '../utils/dateFormat';

interface CommentSectionProps {
  goalId: number;
}

export default function CommentSection({ goalId }: CommentSectionProps) {
  const [kommentare, setKommentare] = useState<Kommentar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadKommentare = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getKommentare(goalId);
      setKommentare(data);
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Laden der Kommentare:', error);
      setError(error.message || 'Fehler beim Laden der Kommentare');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKommentare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await createKommentar(goalId, { content: newComment.trim() });
      setNewComment('');
      await loadKommentare(); // Kommentare neu laden
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Erstellen des Kommentars:', error);
      setError(error.message || 'Fehler beim Erstellen des Kommentars');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (kommentarId: number) => {
    if (!confirm('Möchtest du diesen Kommentar wirklich löschen?')) return;

    try {
      await deleteKommentar(kommentarId);
      await loadKommentare(); // Kommentare neu laden
    } catch (err) {
      const error = err as Error;
      console.error('Fehler beim Löschen des Kommentars:', error);
      setError(error.message || 'Fehler beim Löschen des Kommentars');
    }
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const dateStr = formatToSwiss(date.toISOString().split('T')[0]);
    const timeStr = date.toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} ${timeStr}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Lade Kommentare...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fehleranzeige */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">Fehler: {error}</p>
        </div>
      )}

      {/* Neuer Kommentar */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">💬 Neuer Kommentar</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Schreibe einen Kommentar..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Wird gespeichert...' : 'Kommentar hinzufügen'}
        </button>
      </form>

      {/* Kommentare Liste */}
      {kommentare.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Noch keine Kommentare
          </h3>
          <p className="text-gray-600">
            Sei der Erste, der einen Kommentar hinterlässt!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Kommentare ({kommentare.length})
          </h3>
          {kommentare.map((kommentar) => (
            <div
              key={kommentar.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              {/* Timestamp und Löschen-Button */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">
                  {formatDateTime(kommentar.created_at)}
                </div>
                <button
                  onClick={() => handleDelete(kommentar.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  aria-label="Kommentar löschen"
                >
                  🗑️
                </button>
              </div>

              {/* Kommentar-Inhalt */}
              <p className="text-gray-700 whitespace-pre-wrap">
                {kommentar.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

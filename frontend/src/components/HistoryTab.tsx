import { useEffect, useState } from 'react';
import { getGoalHistory, getKommentare, ZielHistory, Kommentar } from '../api/goals';
import { formatToSwiss } from '../utils/dateFormat';

interface HistoryTabProps {
  goalId: number;
}

// Altes Format: "Kommentar hinzugefügt (ID: 123)" – ID extrahieren für Rückwärtskompatibilität
const OLD_COMMENT_PATTERN = /^Kommentar hinzugefügt \(ID: (\d+)\)$/;
const OLD_COMMENT_UNKNOWN = /^Kommentar hinzugefügt \(ID: None\)$/;

function getCommentContentForHistoryEntry(
  entry: ZielHistory,
  comments: Kommentar[]
): string | null {
  const raw = entry.new_value ?? '';
  if (!raw.trim()) return null;
  // Altes Format mit gültiger ID: aus Kommentar-Liste auflösen
  const match = raw.match(OLD_COMMENT_PATTERN);
  if (match) {
    const commentId = parseInt(match[1], 10);
    const comment = comments.find((c) => c.id === commentId);
    return comment ? comment.content : null;
  }
  // Altes Format "ID: None" – keinen technischen Text anzeigen
  if (OLD_COMMENT_UNKNOWN.test(raw)) return null;
  return raw;
}

export default function HistoryTab({ goalId }: HistoryTabProps) {
  const [history, setHistory] = useState<ZielHistory[]>([]);
  const [comments, setComments] = useState<Kommentar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [historyData, commentsData] = await Promise.all([
          getGoalHistory(goalId),
          getKommentare(goalId),
        ]);
        setHistory(historyData);
        setComments(commentsData);
      } catch (err) {
        const error = err as Error;
        console.error('Fehler beim Laden der History:', error);
        setError(error.message || 'Fehler beim Laden der History');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [goalId]);

  const formatChangeType = (type: string): string => {
    const types: Record<string, string> = {
      created: 'Erstellt',
      updated: 'Aktualisiert',
      status_changed: 'Status geändert',
      deleted: 'Gelöscht',
      comment_added: 'Kommentar hinzugefügt',
    };
    return types[type] || type;
  };

  const formatFieldName = (field: string): string => {
    const fields: Record<string, string> = {
      titel: 'Titel',
      beschreibung: 'Beschreibung',
      start_datum: 'Start-Datum',
      end_datum: 'End-Datum',
      status: 'Status',
      parent_id: 'Übergeordnetes Ziel',
    };
    return fields[field] || field;
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
        <p className="text-gray-600">Lade History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-600">Fehler: {error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Keine History-Einträge
        </h3>
        <p className="text-gray-600">
          Änderungen an diesem Ziel werden hier angezeigt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            {/* Timestamp */}
            <div className="text-sm text-gray-500 mb-2">
              {formatDateTime(entry.changed_at)}
            </div>

            {/* Change Type */}
            <div className="font-medium text-gray-900 mb-1">
              {formatChangeType(entry.change_type)}
            </div>

            {/* Kommentar-Inhalt anzeigen (neu gespeichert oder aus Kommentar-Liste für alte Einträge) */}
            {entry.change_type === 'comment_added' && (() => {
              const content = getCommentContentForHistoryEntry(entry, comments);
              if (!content) return null;
              return (
                <div className="text-sm text-gray-800 mt-2 pl-3 pr-2 py-2 border-l-2 border-blue-300 bg-blue-50/80 rounded-r break-words whitespace-pre-wrap min-h-[2rem]">
                  {content}
                </div>
              );
            })()}

            {/* Details (für andere Typen: field_name / old → new) */}
            {entry.field_name && entry.change_type !== 'comment_added' && (
              <div className="text-sm text-gray-700">
                <span className="font-semibold">
                  {formatFieldName(entry.field_name)}:
                </span>{' '}
                {entry.old_value && (
                  <>
                    <span className="line-through text-gray-500">
                      {entry.old_value}
                    </span>{' '}
                    →{' '}
                  </>
                )}
                <span className="text-green-600">{entry.new_value}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

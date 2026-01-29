import { useEffect, useRef, useState } from 'react';
import { Timeline as VisTimeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { getGoals, updateGoal, Ziel } from '../api/goals';
import { useNavigate } from 'react-router-dom';

// Farben nach Status
const STATUS_COLORS = {
  'offen': '#9CA3AF',           // Grau
  'in Arbeit': '#3B82F6',       // Blau
  'erledigt': '#10B981',        // Grün
};

export default function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<VisTimeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAndRenderTimeline = async () => {
      setLoading(true);
      setError(null);

      try {
        // Ziele von API laden
        const data = await getGoals(false) as Ziel[];
        console.log('Ziele geladen:', data);

        if (!timelineRef.current) return;

        // Daten für vis-timeline mappen
        const items = new DataSet<{
          id: number;
          content: string;
          start: string;
          end: string;
          style: string;
          title: string;
        }>(
          data.map((ziel) => ({
            id: ziel.id,
            content: ziel.titel,
            start: ziel.start_datum,
            end: ziel.end_datum,
            style: `background-color: ${STATUS_COLORS[ziel.status] || STATUS_COLORS.offen}; border-color: ${STATUS_COLORS[ziel.status] || STATUS_COLORS.offen};`,
            title: `${ziel.titel} - Status: ${ziel.status}`, // Tooltip
          }))
        );

        // Timeline-Optionen
        const options = {
          height: '500px',
          margin: {
            item: 10,
            axis: 20,
          },
          zoomMin: 1000 * 60 * 60 * 24 * 7, // Min: 1 Woche
          zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // Max: 2 Jahre
          orientation: 'top',
          stack: true,
          editable: {
            updateTime: true,  // Zeitraum verschieben erlauben
            remove: false,      // Löschen nicht erlauben
            add: false,         // Hinzufügen nicht erlauben
          },
          // onMoving für Feedback während des Drag entfernt - nicht typkompatibel
        };

        // Timeline erstellen oder aktualisieren
        if (timelineInstance.current) {
          timelineInstance.current.setItems(items);
        } else {
          timelineInstance.current = new VisTimeline(
            timelineRef.current,
            items,
            options
          );

          // Klick-Handler für Navigation zu Detail-Seite
          timelineInstance.current.on('select', (properties) => {
            if (properties.items.length > 0) {
              const selectedId = properties.items[0];
              navigate(`/ziel/${selectedId}`);
            }
          });

          // Drag & Drop Handler - wird aufgerufen wenn Item verschoben wurde
          timelineInstance.current.on('changed', async () => {
            const changedItems = items.get();
            
            // Prüfe welche Items geändert wurden
            for (const item of changedItems) {
              const originalGoal = data.find((g) => g.id === item.id);
              
              if (!originalGoal) continue;
              
              // Prüfe ob sich die Daten geändert haben
              const itemStart = new Date(item.start as string | Date).toISOString().split('T')[0];
              const itemEnd = new Date(item.end as string | Date).toISOString().split('T')[0];
              
              if (itemStart !== originalGoal.start_datum || itemEnd !== originalGoal.end_datum) {
                console.log('Item verschoben:', item.id, 'von', originalGoal.start_datum, '-', originalGoal.end_datum, 'zu', itemStart, '-', itemEnd);
                
                try {
                  // Update-Request an API senden
                  await updateGoal(item.id as number, {
                    start_datum: itemStart,
                    end_datum: itemEnd,
                  });
                  
                  console.log('Ziel-Zeitraum erfolgreich aktualisiert');
                  
                  // Originalziel aktualisieren für nächste Änderung
                  originalGoal.start_datum = itemStart;
                  originalGoal.end_datum = itemEnd;
                } catch (error) {
                  console.error('Fehler beim Aktualisieren des Zeitraums:', error);
                  // Bei Fehler: Item zurücksetzen
                  items.update({
                    id: item.id,
                    start: originalGoal.start_datum,
                    end: originalGoal.end_datum,
                  });
                }
              }
            }
          });
        }
      } catch (err) {
        const error = err as Error;
        console.error('Fehler beim Laden der Ziele:', error);
        setError(error.message || 'Fehler beim Laden der Ziele');
      } finally {
        setLoading(false);
      }
    };

    loadAndRenderTimeline();

    // Cleanup beim Unmount
    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
        timelineInstance.current = null;
      }
    };
  }, [navigate]);

  return (
    <div className="bg-white rounded-lg shadow p-6" role="region" aria-label="Timeline-Ansicht">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Timeline</h2>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.offen }}></span>
              <span>Offen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS['in Arbeit'] }}></span>
              <span>In Arbeit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS.erledigt }}></span>
              <span>Erledigt</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 italic">
            💡 Tipp: Ziehe Items, um Zeitraum zu ändern
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Lade Ziele...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">
            Fehler: {error}
            <br />
            <span className="text-sm text-gray-500">
              Stelle sicher, dass das Backend auf http://localhost:8000 läuft.
            </span>
          </p>
        </div>
      )}
      
      {!loading && !error && (
        <div 
          ref={timelineRef} 
          className="border border-gray-200 rounded"
        ></div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Timeline as VisTimeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { getGoals, updateGoal, Ziel, ZielWithChildren } from '../api/goals';
import { useNavigate, Link } from 'react-router-dom';

// Baut Items + Groups für vis-timeline als Tree-Liste: je Hauptziel eine Zeile, darunter direkt seine Unterziele (zusammengehörige Ziele untereinander)
function buildTimelineData(goals: ZielWithChildren[]): {
  items: Array<{ id: number; content: string; start: string; end: string; style: string; title: string; group: string }>;
  groups: Array<{ id: string; content: string; order?: number }>;
  flatGoals: Ziel[];
} {
  const flatGoals: Ziel[] = [];
  const items: Array<{ id: number; content: string; start: string; end: string; style: string; title: string; group: string }> = [];
  const groups: Array<{ id: string; content: string; order?: number }> = [];
  let groupOrder = 0;

  function collectFlat(g: ZielWithChildren) {
    flatGoals.push(g);
    if (g.children) g.children.forEach(collectFlat);
  }

  goals.forEach((goal) => {
    collectFlat(goal);
    // Zeile 1: Dieses Hauptziel (eine Zeile pro Hauptziel)
    const rootGroupId = `g-root-${goal.id}`;
    groups.push({ id: rootGroupId, content: goal.titel, order: groupOrder++ });
    items.push({
      id: goal.id,
      content: goal.titel,
      start: goal.start_datum,
      end: goal.end_datum,
      style: `background-color: ${STATUS_COLORS[goal.status] || STATUS_COLORS.offen}; border-color: ${STATUS_COLORS[goal.status] || STATUS_COLORS.offen};`,
      title: `${goal.titel} - Status: ${goal.status}`,
      group: rootGroupId,
    });
    // Zeile 2: Direkt darunter – Unterziele (Tree-Liste, zusammengehörig)
    if (goal.children && goal.children.length > 0) {
      const childrenGroupId = `g-children-${goal.id}`;
      groups.push({ id: childrenGroupId, content: `↳ ${goal.titel}`, order: groupOrder++ });
      goal.children.forEach((child) => {
        items.push({
          id: child.id,
          content: child.titel,
          start: child.start_datum,
          end: child.end_datum,
          style: `background-color: ${STATUS_COLORS[child.status] || STATUS_COLORS.offen}; border-color: ${STATUS_COLORS[child.status] || STATUS_COLORS.offen};`,
          title: `${child.titel} - Status: ${child.status}`,
          group: childrenGroupId,
        });
      });
    }
  });

  return { items, groups, flatGoals };
}

// Farben nach Status
const STATUS_COLORS = {
  'offen': '#9CA3AF',           // Grau
  'in Arbeit': '#3B82F6',       // Blau
  'erledigt': '#10B981',        // Grün
};

export default function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<VisTimeline | null>(null);
  const [loading, setLoading] = useState(true); // Initial auf true, damit Timeline-Container gerendert wird
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<ZielWithChildren[]>([]);
  const navigate = useNavigate();

  // Effekt 1: Hierarchische Daten laden (für Timeline-Groups = Abhängigkeiten sichtbar)
  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = (await getGoals(true)) as ZielWithChildren[];
        console.log('✅ Ziele (Hierarchie) geladen:', data);
        setTreeData(data);
      } catch (err) {
        const error = err as Error;
        console.error('❌ Fehler beim Laden der Ziele:', error);
        setError(error.message || 'Fehler beim Laden der Ziele');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  // Effekt 2: Timeline initialisieren (wenn Daten vorhanden sind)
  useEffect(() => {
    if (loading || error || treeData.length === 0) {
      console.log('⏸️ Timeline-Init übersprungen:', { loading, error: !!error, dataLength: treeData.length });
      return;
    }

    const initTimeline = async () => {
      if (!timelineRef.current) {
        console.error('❌ timelineRef.current ist NULL! Timeline-Container existiert nicht im DOM.');
        return;
      }

      const { items: itemList, groups: groupList, flatGoals } = buildTimelineData(treeData);

      try {
        const items = new DataSet(itemList);
        const groups = new DataSet(groupList);

        const options = {
          height: '500px',
          margin: { item: 10, axis: 20 },
          zoomMin: 1000 * 60 * 60 * 24 * 7,
          zoomMax: 1000 * 60 * 60 * 24 * 365 * 2,
          orientation: 'top',
          stack: true,
          editable: { updateTime: true, remove: false, add: false },
          groupOrder: 'order',
        };

        if (timelineInstance.current) {
          timelineInstance.current.setData({ items, groups });
          timelineInstance.current.fit();
        } else {
          timelineInstance.current = new VisTimeline(
            timelineRef.current,
            items,
            groups,
            options
          );
          setTimeout(() => timelineInstance.current?.fit(), 100);

          timelineInstance.current.on('select', (properties: { items: number[] }) => {
            if (properties.items.length > 0) navigate(`/ziel/${properties.items[0]}`);
          });

          timelineInstance.current.on('changed', async () => {
            const changedItems = items.get();
            for (const item of changedItems) {
              const originalGoal = flatGoals.find((g) => g.id === item.id);
              if (!originalGoal) continue;
              const itemStart = new Date(item.start as string | Date).toISOString().split('T')[0];
              const itemEnd = new Date(item.end as string | Date).toISOString().split('T')[0];
              if (itemStart !== originalGoal.start_datum || itemEnd !== originalGoal.end_datum) {
                try {
                  await updateGoal(item.id as number, { start_datum: itemStart, end_datum: itemEnd });
                  originalGoal.start_datum = itemStart;
                  originalGoal.end_datum = itemEnd;
                } catch (err) {
                  console.error('Fehler beim Aktualisieren des Zeitraums:', err);
                  items.update({ id: item.id, start: originalGoal.start_datum, end: originalGoal.end_datum });
                }
              }
            }
          });
        }
      } catch (err) {
        console.error('❌ Fehler beim Initialisieren der Timeline:', err);
      }
    };

    initTimeline();

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
        timelineInstance.current = null;
      }
    };
  }, [treeData, loading, error, navigate]);

  // Leerer Zustand - keine Ziele vorhanden
  if (!loading && !error && treeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Keine Ziele vorhanden</h2>
          <p className="text-gray-600 mb-6">
            Erstelle dein erstes Ziel, um es auf der Timeline zu sehen!
          </p>
          <Link
            to="/ziel/neu"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✨ Erstes Ziel erstellen
          </Link>
        </div>
      </div>
    );
  }

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
            💡 Tipp: Ziehe Items, um Zeitraum zu ändern. Gruppen zeigen Hauptziele und Unterziele (Abhängigkeiten).
          </div>
        </div>
      </div>
      
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
      
      {!error && (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
              <p className="text-gray-600">Lade Ziele...</p>
            </div>
          )}
          <div 
            ref={timelineRef} 
            className="border border-gray-200 rounded"
            style={{ minHeight: '500px' }}
          ></div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeTypes,
  Connection,
  addEdge,
  EdgeChange,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getGoals, updateGoal, ZielWithChildren } from '../api/goals';
import { useNavigate, Link } from 'react-router-dom';
import { formatToSwiss } from '../utils/dateFormat';

// Farben nach Status
const STATUS_COLORS = {
  'offen': '#F3F4F6',           // Helles Grau
  'in Arbeit': '#DBEAFE',       // Helles Blau
  'erledigt': '#D1FAE5',        // Helles Grün
};

const STATUS_BORDER_COLORS = {
  'offen': '#9CA3AF',           // Grau
  'in Arbeit': '#3B82F6',       // Blau
  'erledigt': '#10B981',        // Grün
};

// Custom Node-Komponente
function GoalNode({ data }: { data: { label: string; status: string; dates?: string } }) {
  return (
    <div
      className="px-4 py-3 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg"
      style={{
        backgroundColor: STATUS_COLORS[data.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.offen,
        borderLeft: `4px solid ${STATUS_BORDER_COLORS[data.status as keyof typeof STATUS_BORDER_COLORS] || STATUS_BORDER_COLORS.offen}`,
        minWidth: '180px',
        maxWidth: '250px',
      }}
    >
      <div className="font-semibold text-gray-900 text-sm mb-1">{data.label}</div>
      <div className="text-xs text-gray-600">{data.status}</div>
      {data.dates && (
        <div className="text-xs text-gray-500 mt-1">{data.dates}</div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  goalNode: GoalNode,
};

export default function Tree() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Funktion zum Erstellen von Knoten und Kanten aus hierarchischen Daten
  const buildNodesAndEdges = useCallback(
    (
      goals: ZielWithChildren[],
      parentId: string | null = null,
      level: number = 0,
      xOffset: number = 0
    ): { nodes: Node[]; edges: Edge[]; nextXOffset: number } => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      let currentXOffset = xOffset;

      goals.forEach((goal) => {
        const nodeId = `goal-${goal.id}`;
        const xPos = currentXOffset * 300;
        const yPos = level * 150;

        newNodes.push({
          id: nodeId,
          type: 'goalNode',
          position: { x: xPos, y: yPos },
          data: {
            label: goal.titel,
            status: goal.status,
            dates: `${formatToSwiss(goal.start_datum)} - ${formatToSwiss(goal.end_datum)}`,
          },
        });

        if (parentId) {
          newEdges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            animated: false,
            style: { stroke: '#94A3B8' },
          });
        }

        // Rekursiv Kinder verarbeiten
        if (goal.children && goal.children.length > 0) {
          const childrenResult = buildNodesAndEdges(
            goal.children,
            nodeId,
            level + 1,
            currentXOffset
          );
          newNodes.push(...childrenResult.nodes);
          newEdges.push(...childrenResult.edges);
          currentXOffset = childrenResult.nextXOffset;
        } else {
          currentXOffset++;
        }
      });

      return { nodes: newNodes, edges: newEdges, nextXOffset: currentXOffset };
    },
    []
  );

  // Daten laden und Baum aufbauen
  useEffect(() => {
    const loadTree = async () => {
      setLoading(true);
      setError(null);

      try {
        // Hierarchische Daten von API laden
        const data = (await getGoals(true)) as ZielWithChildren[];
        console.log('Hierarchische Ziele geladen:', data);

        if (data.length === 0) {
          setError('Keine Ziele vorhanden. Erstelle zunächst einige Ziele im Backend.');
          setLoading(false);
          return;
        }

        // Knoten und Kanten erstellen
        const { nodes, edges } = buildNodesAndEdges(data);
        setNodes(nodes);
        setEdges(edges);
      } catch (err) {
        const error = err as Error;
        console.error('Fehler beim Laden der Ziele:', error);
        setError(error.message || 'Fehler beim Laden der Ziele');
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [buildNodesAndEdges, setNodes, setEdges]);

  // Klick auf Knoten → Navigation zur Detail-Seite
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const goalId = node.id.replace('goal-', '');
      navigate(`/ziel/${goalId}`);
    },
    [navigate]
  );

  // Drag & Drop Handler für Kanten (parent_id ändern)
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const targetGoalId = parseInt(connection.target.replace('goal-', ''));
      const newParentId = parseInt(connection.source.replace('goal-', ''));

      setUpdating(true);
      try {
        // Update parent_id via API
        await updateGoal(targetGoalId, {
          parent_id: newParentId,
        });

        console.log(`Ziel ${targetGoalId} wurde zu Unterziel von ${newParentId}`);

        // Edge hinzufügen
        setEdges((eds) => addEdge(connection, eds));

        // Erfolgs-Meldung
        alert(`Ziel wurde erfolgreich verschoben. Seite wird neu geladen.`);
        
        // Seite neu laden, um Hierarchie neu zu berechnen
        window.location.reload();
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Hierarchie:', error);
        alert('Fehler beim Verschieben des Ziels. Bitte versuchen Sie es erneut.');
      } finally {
        setUpdating(false);
      }
    },
    [setEdges]
  );

  // Handler für Kanten-Löschung (parent_id auf null setzen)
  const onEdgesChange = useCallback(
    async (changes: EdgeChange[]) => {
      // Prüfe ob eine Kante gelöscht wurde
      const removedEdge = changes.find((change) => change.type === 'remove');
      
      if (removedEdge && 'id' in removedEdge) {
        const edgeId = removedEdge.id;
        const edge = edges.find((e) => e.id === edgeId);
        
        if (edge) {
          const targetGoalId = parseInt(edge.target.replace('goal-', ''));
          
          setUpdating(true);
          try {
            // parent_id entfernen (Backend erwartet undefined, nicht null)
            await updateGoal(targetGoalId, {
              parent_id: undefined,
            });

            console.log(`Ziel ${targetGoalId} ist jetzt ein Hauptziel`);

            // Edge entfernen
            setEdges((eds) => applyEdgeChanges(changes, eds));

            // Erfolgs-Meldung
            alert(`Ziel wurde erfolgreich zum Hauptziel gemacht. Seite wird neu geladen.`);
            
            // Seite neu laden
            window.location.reload();
          } catch (error) {
            console.error('Fehler beim Aktualisieren der Hierarchie:', error);
            alert('Fehler beim Ändern der Hierarchie. Bitte versuchen Sie es erneut.');
          } finally {
            setUpdating(false);
          }
          return;
        }
      }

      // Standard Edge-Changes anwenden
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [edges, setEdges]
  );

  // Leerer Zustand - keine Ziele vorhanden
  if (!loading && !error && nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🌳</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Keine Ziele vorhanden</h2>
          <p className="text-gray-600 mb-6">
            Erstelle dein erstes Ziel, um es im Zielbaum zu visualisieren!
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
    <div className="bg-white rounded-lg shadow p-6" role="region" aria-label="Zielbaum-Ansicht">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Zielbaum</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: STATUS_COLORS.offen }}
            ></span>
            <span>Offen</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: STATUS_COLORS['in Arbeit'] }}
            ></span>
            <span>In Arbeit</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: STATUS_COLORS.erledigt }}
            ></span>
            <span>Erledigt</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-96">
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
        <>
          {updating && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              ⏳ Aktualisiere Hierarchie...
            </div>
          )}
          <div className="mb-2 text-sm text-gray-600 italic">
            💡 Tipp: Verbinde Knoten, um Hierarchie zu ändern (ziehe von Parent zu Child)
          </div>
          <div className="border border-gray-200 rounded" style={{ height: '600px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={2}
              deleteKeyCode="Delete"
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  );
}

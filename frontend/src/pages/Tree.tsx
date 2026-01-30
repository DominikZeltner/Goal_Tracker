import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  Position,
  StraightEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeTypes,
  Connection,
  addEdge,
  EdgeChange,
  applyEdgeChanges,
  ReactFlowInstance,
} from '@xyflow/react';
import { getGoal, getGoals, updateGoal, Ziel, ZielWithChildren } from '../api/goals';
import { useNavigate, Link } from 'react-router-dom';
import { formatToSwiss } from '../utils/dateFormat';
import { LabeledHandle } from '../components/LabeledHandle';

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

// Kantenfarben nach Parent-Status (Abhängigkeiten sichtbar)
const EDGE_COLORS_BY_STATUS: Record<string, string> = {
  'offen': '#9CA3AF',
  'in Arbeit': '#3B82F6',
  'erledigt': '#10B981',
};

// Custom Node mit Labeled Handles (Eingang/Ausgang beschriftet)
function GoalNode({ data }: { data: { label: string; status: string; dates?: string } }) {
  return (
    <div
      className="relative px-4 py-3 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg"
      style={{
        backgroundColor: STATUS_COLORS[data.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.offen,
        borderLeft: `4px solid ${STATUS_BORDER_COLORS[data.status as keyof typeof STATUS_BORDER_COLORS] || STATUS_BORDER_COLORS.offen}`,
        minWidth: '180px',
        maxWidth: '250px',
      }}
    >
      <div className="absolute -right-2 top-1/2 -translate-y-1/2">
        <LabeledHandle
          type="target"
          position={Position.Right}
          id="right"
        />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2">
        <LabeledHandle
          type="source"
          position={Position.Left}
          id="left"
        />
      </div>
      
      <div className="font-semibold text-gray-900 text-sm mb-1">{data.label}</div>
      <div className="text-xs text-gray-600">{data.status}</div>
      {data.dates && (
        <div className="text-xs text-gray-500 mt-1">{data.dates}</div>
      )}
    </div>
  );
}

// Maximale Tiefe des Baums (für Flow-Layout: links tief, rechts Hauptziele)
function getMaxDepth(goals: ZielWithChildren[], level: number = 0): number {
  let max = level;
  goals.forEach((g) => {
    if (g.children && g.children.length > 0) {
      max = Math.max(max, getMaxDepth(g.children, level + 1));
    }
  });
  return max;
}

const X_SPACING = 320; // Abstand zwischen Hierarchie-Ebenen (links → rechts)
const Y_SPACING = 140; // Abstand zwischen Geschwister-Knoten

const nodeTypes: NodeTypes = {
  goalNode: GoalNode,
};

// Kanten-Typen: StraightEdge für sichtbare Verbindungslinien
const edgeTypes = {
  straight: StraightEdge,
};

export default function Tree() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const navigate = useNavigate();

  const buildUpdatePayload = (goal: Ziel, parentId: number | null) => ({
    titel: goal.titel,
    beschreibung: goal.beschreibung,
    start_datum: goal.start_datum,
    end_datum: goal.end_datum,
    status: goal.status,
    parent_id: parentId,
  });

  // Knoten + Kanten: Flow von links (tiefste Ebene) nach rechts (Hauptziele), jede Kante verbindet Unterziel mit übergeordnetem Ziel
  const buildNodesAndEdges = useCallback(
    (
      goals: ZielWithChildren[],
      parentId: string | null,
      parentStatus: string | null,
      level: number,
      yOffset: number,
      maxDepth: number
    ): { nodes: Node[]; edges: Edge[]; nextYOffset: number } => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      let currentYOffset = yOffset;

      goals.forEach((goal) => {
        const nodeId = `goal-${goal.id}`;
        // Links = tiefste Hierarchie, rechts = Hauptziele (level 0)
        const xPos = (maxDepth - level) * X_SPACING;
        const yPos = currentYOffset * Y_SPACING;

        newNodes.push({
          id: nodeId,
          type: 'goalNode',
          position: { x: xPos, y: yPos },
          data: {
            label: goal.titel,
            status: goal.status,
            dates: formatToSwiss(goal.end_datum),
          },
        });

        if (parentId) {
          const edgeColor = (parentStatus && EDGE_COLORS_BY_STATUS[parentStatus]) || EDGE_COLORS_BY_STATUS['offen'];
          newEdges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            sourceHandle: 'left',
            targetHandle: 'right',
            type: 'straight',
            animated: false,
            style: { stroke: edgeColor, strokeWidth: 3 },
          });
        }

        if (goal.children && goal.children.length > 0) {
          const childrenResult = buildNodesAndEdges(
            goal.children,
            nodeId,
            goal.status,
            level + 1,
            currentYOffset,
            maxDepth
          );
          newNodes.push(...childrenResult.nodes);
          newEdges.push(...childrenResult.edges);
          currentYOffset = childrenResult.nextYOffset;
        } else {
          currentYOffset++;
        }
      });

      return { nodes: newNodes, edges: newEdges, nextYOffset: currentYOffset };
    },
    []
  );

  // Auto Format: Layout (Flow links→rechts) neu anwenden, danach fitView
  const handleAutoFormat = useCallback(async () => {
    setFormatting(true);
    setError(null);
    try {
      const raw = await getGoals(true);
      const data: ZielWithChildren[] = Array.isArray(raw) ? raw : [];
      if (data.length === 0) {
        setNodes([]);
        setEdges([]);
      } else {
        const maxDepth = getMaxDepth(data);
        const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(data, null, null, 0, 0, maxDepth);
        setNodes(newNodes);
        setEdges(newEdges);
        setTimeout(() => reactFlowRef.current?.fitView({ padding: 0.2 }), 100);
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Fehler beim Formatieren');
    } finally {
      setFormatting(false);
    }
  }, [buildNodesAndEdges, setNodes, setEdges]);

  // Daten laden und Baum aufbauen
  useEffect(() => {
    const loadTree = async () => {
      setLoading(true);
      setError(null);

      try {
        // Hierarchische Daten von API laden (immer als Array behandeln)
        const raw = await getGoals(true);
        const data: ZielWithChildren[] = Array.isArray(raw) ? raw : [];
        console.log('Hierarchische Ziele geladen:', data);

        if (data.length === 0) {
          setError('Keine Ziele vorhanden. Erstelle zunächst einige Ziele im Backend.');
          setLoading(false);
          return;
        }

        // Maximale Tiefe für Flow-Layout (links tief, rechts Hauptziele)
        const maxDepth = getMaxDepth(data);
        const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(data, null, null, 0, 0, maxDepth);
        setNodes(newNodes);
        setEdges(newEdges);
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

  // Nach dem Setzen der Knoten/Kanten View anpassen (fitView)
  useEffect(() => {
    if (nodes.length === 0) return;
    const timer = setTimeout(() => {
      reactFlowRef.current?.fitView({ padding: 0.2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [nodes.length, edges.length]);

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
        const targetGoal = await getGoal(targetGoalId);
        await updateGoal(targetGoalId, buildUpdatePayload(targetGoal, newParentId));

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
            const targetGoal = await getGoal(targetGoalId);
            await updateGoal(targetGoalId, buildUpdatePayload(targetGoal, null));

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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-800">Zielbaum</h2>
          <button
            type="button"
            onClick={handleAutoFormat}
            disabled={loading || formatting || nodes.length === 0}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formatting ? 'Formatieren…' : 'Auto Format'}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
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
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 italic">Kantenfarbe = Status des übergeordneten Ziels</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 italic">Flow: links = Unterziele (tief), rechts = Hauptziele</span>
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
            💡 Tipp: „Auto Format“ strukturiert den Baum (Flow links→rechts). Per Drag & Drop kannst du Knoten verbinden (Parent→Child) oder Kanten löschen, um die Hierarchie zu ändern.
          </div>
          <div className="border border-gray-200 rounded w-full" style={{ width: '100%', height: '600px', backgroundColor: '#f9fafb' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodesConnectable
              nodesFocusable
              onInit={(instance) => {
                reactFlowRef.current = instance;
                setTimeout(() => instance.fitView({ padding: 0.2 }), 50);
              }}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{
                type: 'straight',
                style: { stroke: '#374151', strokeWidth: 3 },
                animated: false,
              }}
              fitView
              fitViewOptions={{ padding: 0.2 }}
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

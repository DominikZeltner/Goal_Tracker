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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getGoals, ZielWithChildren } from '../api/goals';
import { useNavigate } from 'react-router-dom';

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
function GoalNode({ data }: { data: any }) {
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
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
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
            dates: `${goal.start_datum} - ${goal.end_datum}`,
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
      } catch (err: any) {
        console.error('Fehler beim Laden der Ziele:', err);
        setError(err.message || 'Fehler beim Laden der Ziele');
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
        <div className="border border-gray-200 rounded" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState, useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import type { ForceGraphMethods as FGMethods2D, NodeObject } from 'react-force-graph-2d';
import type { ForceGraphMethods as FGMethods3D, NodeObject as NodeObject3D } from 'react-force-graph-3d';
import type { Article } from './types';
import { Header } from './components/Header';
import { ArticleDetails } from './components/ArticleDetails';
import { generateGraphData, searchData } from './algo/textProcessor';
import { ARTICLES } from './articles';
import ArticleSheet from './components/ArticleSheet';
import { ChatWrapper } from './components/ChatWrapper';


function mapValueToRgb(value: number, maxSim: number): string {
  const normalized = maxSim === 0 ? 0 : value / maxSim;
  const clamped = Math.min(1, Math.max(0, normalized));
  const weight = 0.5;
  const weightedValue = Math.pow(clamped, weight);

  const r = Math.floor(weightedValue * 255);
  const b = Math.floor((1 - weightedValue) * 255);
  const g = 0;

  return `rgb(${r}, ${g}, ${b})`;
}

function App() {

  const [data, setData] = useState(() => generateGraphData(ARTICLES));
  const lookUp = useMemo(() => data.nodes.reduce((acc, node) => ({ ...acc, [node.id]: node }), {} as Record<string, NodeObject<Article> | NodeObject3D<Article>>), [data]);
  const genData = useCallback(({ threshold }: { threshold?: number, oneConnection?: boolean }) => setData(generateGraphData(ARTICLES, { threshold })), []);
  const [selectedNode, setSelectedNode] = useState<NodeObject<Article> | NodeObject3D<Article> | null>(null);
  const [search, setSearch] = useState("");
  const ref2D = useRef<FGMethods2D<NodeObject<Article>>>(undefined);
  const ref3D = useRef<FGMethods3D<NodeObject3D<Article>>>(undefined);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!search) return new Set();
    return new Set(data.nodes.filter(node =>
      node.title.toLowerCase().includes(search.toLowerCase()) ||
      node.content.toLowerCase().includes(search.toLowerCase())
    ).map(node => node.id));
  }, [search, data]);

  const handleNodeClick = (node: NodeObject<Article>) => {
    setSelectedNode(node);
    if (mode === "2d") {
      ref2D.current?.centerAt(node.x, node.y, 1000);
      ref2D.current?.zoom(2, 2000);

    } else {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x!, node.y!, node.z!);

      ref3D.current?.cameraPosition(
        { x: node.x! * distRatio, y: node.y! * distRatio, z: node.z! * distRatio }, // New camera location
        { x: node.x!, y: node.y!, z: node.z },
        2000
      );
    }
  }

  const zoomToSearchExtent = () => {
    if (mode === "2d") {
      ref2D.current?.zoomToFit(400, 100, (node: NodeObject<Article>) => filteredNodes.has(node.id));
    } else {
      ref3D.current?.zoomToFit(400, 100, (node: NodeObject3D<Article>) => filteredNodes.has(node.id));
    }
  }

  const onBadgeClick = (id: number | string) => {
    const node = lookUp[id];
    if (!node) return;
    handleNodeClick(node);
  }

  const nodeColor = (node: NodeObject<Article> | NodeObject3D<Article>) => {
    return (selectedNode?.id === node.id ? "purple" : filteredNodes.has(node.id) ? "green" : "#666");
  }

  return (
    <div className="h-screen w-full flex flex-col  overflow-hidden text-foreground">

      <Header
        search={search}
        onSearchChange={setSearch}
        nodeCount={data.nodes.length}
        linkCount={data.links.length}
        setData={genData}
        setMode={setMode}
        zoomToSearchExtent={zoomToSearchExtent}
        setIsSheetOpen={setIsSheetOpen}
      />

      <main className="flex-1 relative flex overflow-hidden">
        {
          mode === "2d" && (

            <ForceGraph2D
              ref={ref2D}
              graphData={data}
              nodeLabel="title"
              nodeColor={nodeColor}
              linkLabel={link => link.commonWords?.join(", ")}
              linkColor={(link) =>
                mapValueToRgb(link.similarity, data.maxSim)
              }
              linkWidth={link => link.size}
              onNodeClick={handleNodeClick}
              onBackgroundClick={() => setSelectedNode(null)}
              d3VelocityDecay={0.1}
            />)
        }
        {mode === "3d" && (
          <ForceGraph3D
            ref={ref3D}
            graphData={data}
            nodeLabel="title"
            backgroundColor="#ffffff"
            nodeColor={nodeColor}
            linkLabel={link => link.commonWords?.join(", ")}
            linkColor={(link) =>
              mapValueToRgb(link.similarity, data.maxSim)
            }
            linkWidth={link => {
              return link.similarity * 5;
            }}
            onNodeClick={handleNodeClick}
            onBackgroundClick={() => setSelectedNode(null)}
            d3VelocityDecay={0.1}
          />
        )}
        {
          selectedNode && <ArticleDetails
            search={search}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        }
        <ChatWrapper onBadgeClick={onBadgeClick} />
        {isSheetOpen && <ArticleSheet onArticleClick={onBadgeClick} articles={searchData(ARTICLES, search)} onClose={() => setIsSheetOpen(false)} />}
      </main>
    </div>
  );
}

export default App

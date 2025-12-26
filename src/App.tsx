import { useMemo, useState, useRef } from 'react'
import { generateGraphData } from './algo/textProcessor';
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import type { Article } from './types';

const SAMPLE_ARTICLES = [
  { title: "React Basics", content: "React is a JavaScript library for building user interfaces. It uses components." },
  { title: "Vue vs React", content: "Vue is similar to React. Both are JavaScript libraries for interfaces." },
  { title: "Cooking Pasta", content: "Boil water. Add salt. Cook pasta for 10 minutes. Drain and serve with sauce." },
  { title: "Italian Cuisine", content: "Pasta and Pizza are staples of Italian cuisine. Tomato sauce is common." },
  { title: "Machine Learning", content: "Machine learning uses algorithms to parse data, learn from it, and make predictions." },
  { title: "AI and Data", content: "Artificial Intelligence relies on data. Algorithms process this data." },
  { title: "Pizza Dough", content: "Flour, water, yeast, and salt are needed for pizza dough. Let it rise." },
];

function App() {
  const [data, setData] = useState(() => generateGraphData(SAMPLE_ARTICLES));
  const [selectedNode, setSelectedNode] = useState<NodeObject<Article> | null>(null);
  const [search, setSearch] = useState("");
  const ref = useRef<ForceGraphMethods<NodeObject<Article>>>(undefined);

  const filteredNodes = useMemo(() => {
    if (!search) return new Set();
    return new Set(data.nodes.filter(node =>
      node.title.toLowerCase().includes(search.toLowerCase()) ||
      node.content.toLowerCase().includes(search.toLowerCase())
    ).map(node => node.id));
  }, [search, data]);

  const handleNodeClick = (node: NodeObject<Article>) => {
    setSelectedNode(node);
    ref.current?.centerAt(node.x, node.y, 1000);
    ref.current?.zoom(2, 2000);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* --- Header / Search Bar --- */}
      <div style={{ padding: "10px", background: "#f0f0f0", display: "flex", gap: "10px", borderBottom: "1px solid #ccc", zIndex: 10 }}>
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px", flex: 1, borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <div style={{ padding: "8px" }}>
          {data.nodes.length} Articles | {data.links.length} Connections
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* The Graph */}
        <ForceGraph2D
          ref={ref}
          graphData={data}
          nodeLabel="title"
          nodeColor={node => filteredNodes.has(node.id) ? "#ff0000" : (selectedNode === node ? "#3f51b5" : "#666")}
          nodeRelSize={6}
          linkWidth={5}
          linkLabel={link => link.commonWords?.join(", ")}
          linkColor={() => "blue"}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedNode(null)}
          // Physics settings to separate clusters nicely
          d3VelocityDecay={0.1}
        />

        {/* The "Expandable" Article Overlay */}
        {selectedNode && (
          <div style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "300px",
            maxHeight: "80%",
            overflowY: "auto",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #ddd"
          }}>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
            <h2 style={{ marginTop: 0 }}>{selectedNode.title}</h2>
            <p style={{ lineHeight: "1.6", color: "#333" }}>{selectedNode.content}</p>
            <hr />
            <small style={{ color: "#777" }}>
              <strong>Keywords (TF-IDF):</strong><br />
              {/* This is a simple visualization of what words connected this article */}
              Matches found via shared vocabulary.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default App

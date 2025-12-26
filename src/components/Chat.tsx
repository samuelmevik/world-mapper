import { useState, useEffect } from 'react';
import { CreateMLCEngine, type MLCEngineInterface, type InitProgressReport } from "@mlc-ai/web-llm";
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { Voy } from 'voy-search';
import { Send, Bot, User, FileText } from 'lucide-react';
import { model } from '@/model';

interface RawArticleChunk {
  id: number | string;
  chunkIndex: number;
  title: string;
  content: string;
  vector: number[];
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  sources?: { id: number | string; title: string }[];
}

let globalEngine: MLCEngineInterface | null = null;
let globalIndex: Voy | null = null;
let globalExtractor: FeatureExtractionPipeline | null = null;
let globalData: Record<string, RawArticleChunk> | null = null;
let globalInitPromise: Promise<void> | null = null;

export default function LocalAIChat({ onBadgeClick }: { onBadgeClick: (id: number | string) => void }) {

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ready! Ask me anything about Amenor.' }
  ]);
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<string>('Initializing...');
  const [isReady, setIsReady] = useState<boolean>(false);


  useEffect(() => {
    let isMounted = true;

    async function init() {

      if (globalEngine && globalIndex && globalExtractor && globalData) {
        setIsReady(true);
        setStatus('Ready');
        return;
      }


      if (globalInitPromise) {
        setStatus('Restoring engine connection...');
        try {
          await globalInitPromise;
          if (isMounted && globalEngine) {
            setIsReady(true);
            setStatus('Ready');
          }
        } catch (err) {
          if (isMounted) setStatus('Error loading models.');
        }
        return;
      }


      globalInitPromise = (async () => {
        try {
          setStatus('Loading document index...');
          const response = await fetch('llm.json');
          if (!response.ok) throw new Error("Could not find public/llm.json");

          const rawData: RawArticleChunk[] = await response.json();
          globalData = rawData.reduce((acc, item) => ({ ...acc, [`${item.id}-${item.chunkIndex}`]: item }), {});

          const resources = rawData.map(d => ({
            id: String(d.id),
            title: d.title,
            url: `${d.id}-${d.chunkIndex}`,
            content: d.content,
            embeddings: d.vector
          }));

          const voy = new Voy();
          voy.index({ embeddings: resources });
          globalIndex = voy;

          setStatus('Loading embedding model...');
          globalExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as FeatureExtractionPipeline;

          setStatus('Loading LLM (this needs WebGPU)...');
          globalEngine = await CreateMLCEngine(
            model,
            {
              initProgressCallback: (info: InitProgressReport) => {
                if (isMounted) setStatus(info.text);
              }
            }
          );
        } catch (err) {
          console.error(err);
          throw err;
        }
      })();

      try {
        await globalInitPromise;
        if (isMounted) {
          setIsReady(true);
          setStatus('Ready');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (isMounted) setStatus(`Error: ${errorMessage}`);
        globalInitPromise = null;
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !isReady || !globalExtractor || !globalIndex || !globalEngine || !globalData) return;

    const userQuestion = input;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
    setStatus('Searching...');

    try {
      const qOutput = await globalExtractor(userQuestion, { pooling: 'mean', normalize: true });
      const qVector = new Float32Array(Array.from(qOutput.data));

      const results = globalIndex.search(qVector, 3);
      const d = results.neighbors.map(({ url }) => globalData![url]);

      const contextDocs = d.flatMap(({ content, title, id }) =>
        `--- Excerpt from: ${title} (ID: ${id}) ---\n${content}`
      ).join("\n\n");

      setStatus('Thinking...');

      const systemPrompt = `You are a helpful, factual assistant for Amenor.
Use the Context below to answer the user's question. 

CONTEXT:
${contextDocs}

INSTRUCTIONS:
- Only answer based on the Context.
- If the answer is not in the Context, explicitly say "I don't know."
- Do not make up facts.
`;

      const historyWindow = messages.slice(-2);

      const reply = await globalEngine.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          ...historyWindow,
          { role: "user", content: userQuestion }
        ],
        temperature: 0.1
      });

      const aiAnswer = reply.choices[0].message.content || "No response generated.";

      setMessages(prev => [...prev, { role: 'assistant', content: aiAnswer, sources: d.map(doc => ({ id: doc.id, title: doc.title })) }]);
      setStatus('Ready');
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error generating answer." }]);
      setStatus('Error');
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 bg-gray-50 font-sans">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          {isReady ? (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          ) : (
            <div className="w-4 h-4 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />
          )}
          <span>{status}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Bot size={18} className="text-blue-600" />
              </div>
            )}

            <div className={`p-3 rounded-lg max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}>
              {msg.content}
              <div className='flex gap-1 mt-1'>
                {
                  Object.values(msg.sources?.reduce((acc: Record<string, { id: number | string; title: string }>, source) => ({ ...acc, [source.id]: source }), {}) ?? {}).map((source) => (
                    <button
                      key={source.id}
                      onClick={() => onBadgeClick(source.id)}
                      title={source.title}
                      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-200 ease-in-out text-xs font-medium max-w-45 cursor-pointer"
                    >
                      <FileText className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-100" />
                      <span className="truncate">{source.title}</span>
                    </button>
                  ))
                }
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                <User size={18} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-2 rounded-lg border border-gray-300 flex items-center gap-2 shadow-sm">
        <input
          type="text"
          className="flex-1 p-2 outline-none text-gray-700 bg-transparent disabled:opacity-50"
          placeholder={isReady ? "Ask a question..." : "Waiting for models..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!isReady}
        />
        <button
          onClick={handleSend}
          disabled={!isReady || !input.trim()}
          className={`p-2 rounded-md transition-colors ${isReady && input.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
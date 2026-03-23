
---

# World Mapper

**World Mapper** is a high performance, interactive knowledge management system for TTRPG world building. It transforms raw lore documents into a dynamic, traversable network using **Vector Space Modeling** to reveal semantic connections between locations, NPCs, and events.

Unlike standard note taking apps, World Mapper uses a custom **TF-IDF engine** to weight links based on "Fantasy Keywords" unique terms that don't exist in the standard English lexicon.

[Video showing World Mapper in action](https://www.youtube.com/watch?v=7ZIddP6vYfU)

[![Video showing World Mapper in action](https://img.youtube.com/vi/7ZIddP6vYfU/0.jpg)](https://www.youtube.com/watch?v=7ZIddP6vYfU)

---

## Key Features

* **Custom TF-IDF Vector Engine:** The app builds a local search index and connection matrix by calculating term importance across your entire corpus.
* **"Fantasy First" Graph Logic:** By filtering out "stop words" from a 350k+ English word dictionary, the graph prioritizes links based on your unique world building terminology (e.g. *Mithral*).
* **Dynamic Force-Directed Graph:** Toggle between 2D and 3D views. Node sizes scale dynamically based on their degree of connectivity (importance in the world).
* **Local AI Oracle (Phi-3.5):** A fully private, in browser chatbot powered by `Web-LLM`. It acts as a world guide, answering queries based on your lore without sending data to a server.
* **Live Search & Highlighting:** Uses **Cosine Similarity** to rank results, providing realtime highlighting in both the graph visualization and the document viewer.

---

## Technical Implementation

### Graph Generation Logic
The graph is generated on the fly based on a user defined similarity threshold:
1.  **Stop Word Filtering:** Standard English is ignored to ensure links are "meaningful" (e.g., two towns linked by a deity name rather than the word "the").
2.  **Edge Creation:** Links are established only if the Cosine Similarity $S > \text{threshold}$.
3.  **Metadata:** Every link stores `commonWords`, allowing the UI to show exactly *why* two documents are connected.

---

## Tech Stack

| Category          | Tools                                                    |
| :---------------- | :------------------------------------------------------- |
| **Frontend**      | React 19, Vite, TypeScript, Tailwind CSS 4.0             |
| **Visualization** | `react-force-graph` (2D/3D), D3                          |
| **LLM / AI**      | `@mlc-ai/web-llm` (Phi-3.5-mini), `@xenova/transformers` |
| **Search Engine** | Custom TF-IDF implementation + `voy-search`              |
| **UI Components** | Radix UI, Lucide Icons                                   |
| **Runtime**       | Bun                                                      |

---

## Getting Started

1.  **Install dependencies:**
    ```bash
    bun install
    ```
2.  **Generate Indices:**
    Process your lore documents into the vector index and LLM embeddings.
    ```bash
    bun run gen:search
    bun run gen:llm
    ```
3.  **Run Development:**
    ```bash
    bun run dev
    ```

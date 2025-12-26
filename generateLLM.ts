import type { Article, ArticleChunk, ArticleChunkWithVector } from "@/types";
import { ARTICLES } from "./src/articles";
import { FeatureExtractionPipeline, pipeline } from '@xenova/transformers';

const OUTPUT_FILE = "./public/llm.json"; // Where to save the JSON for React

export const prepareChunks = (articles: Article[]) => {
  const chunks: ArticleChunk[] = [];
  for (const article of articles) {
    const words = article.content.split(" ");
    if (words.length <= 300) {
      chunks.push({ ...article, chunkIndex: 0 });
    } else {
      for (let i = 0; i < words.length; i += 175) {
        const chunkWords = words.slice(i, i + 200);
        chunks.push({
          ...article,
          chunkIndex: i / 175,
          content: chunkWords.join(" ")
        });
      }
    }
  }
  return chunks;
}

const createOutput = async (extractor: FeatureExtractionPipeline, chunks: ArticleChunk[]) => {
  const out: ArticleChunkWithVector[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const output = await extractor(chunk.content, {
      pooling: 'mean',
      normalize: true
    });
    out.push({
      ...chunk, vector: Array.from(output.data)
    })
  }
  return out;
}



console.log("1. Loading model...");
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
console.log("2. Chunking articles...");
const chunks = prepareChunks(ARTICLES);
console.log(`3. Generating Embeddings for ${chunks.length} chunks...`);
const chunksWithVectors = await createOutput(extractor, chunks);
await Bun.write(OUTPUT_FILE, JSON.stringify(chunksWithVectors, null, 2));

console.log(`✅ Success! Wrote ${chunks.length} items to ${OUTPUT_FILE}`);

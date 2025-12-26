import type { Article } from "../types";
import data from "./words_dictionary.json";

const STOP_WORDS = new Set(Object.keys(data));

const tokenizeText = (text: string) => text
  .toLowerCase()
  .replaceAll(/[^a-z0-9\s]/g, "") // Remove punctuation
  .split(/\s+/)
  .filter(word => word.length > 2 && !STOP_WORDS.has(word));

const IDF = (documents: string[][], vocabulary: string[]) => {
  const idf: Record<string, number> = {};
  for (const term of vocabulary) {
    const docCount = documents.filter(doc => doc.includes(term)).length;
    idf[term] = Math.log(documents.length / (1 + docCount));
  }
  return idf;
}

const TF = (documents: string[][], idf: Record<string, number>) =>
  documents.map(doc => {
    const vec: Record<string, number> = {};

    for (const word of doc) {
      vec[word] = (vec[word] || 0) + 1; // Term Frequency
    }
    // Multiply TF by IDF
    for (const word of Object.keys(vec)) {
      vec[word] = vec[word] * idf[word];
    }
    return vec;
  });

const getCosineSimilarity = (vecA: Record<string, number>, vecB: Record<string, number>) => {
  const commonWords = Object.keys(vecA).filter(word => vecB[word]);
  if (commonWords.length === 0) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const word of commonWords) {
    dotProduct += vecA[word] * vecB[word];
  }

  for (const val of Object.values(vecA)) {
    magA += val * val;
  }
  for (const val of Object.values(vecB)) {
    magB += val * val;
  }

  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};



export const generateGraphData = (articles: Article[], threshold = 0) => {
  const documents = articles.map(article => tokenizeText(article.content + " " + article.title));
  const vocabulary = [...new Set(documents.flat())];

  const idf = IDF(documents, vocabulary);
  const vectors = TF(documents, idf);

  const nodes = articles.map((article, index) => ({
    id: index,
    ...article,
    val: 5
  }))
  const links = [];
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const sim = getCosineSimilarity(vectors[i], vectors[j]);
      const commonWords = Object.keys(vectors[i]).filter(word => vectors[j][word]);
      if (sim > threshold) {
        links.push({
          source: i,
          target: j,
          value: sim, // We can use this to make the line thicker
          commonWords,
        });
      }
    }
  }
  return { nodes, links };
}


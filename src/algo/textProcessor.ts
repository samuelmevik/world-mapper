import type { Article } from "../types";
const { default: data } = await import("../assets/words_dictionary.json");

type Vector = Record<string, number>;

const STOP_WORDS = new Set(Object.keys(data));

const tokenizeText = (text: string, filterStopWords: boolean = false) => text
  .toLowerCase()
  .replaceAll(/[^a-z0-9\s]/g, "") // Remove punctuation
  .split(/\s+/)
  .filter(word =>
    word.length > 2 &&
    (!filterStopWords || !STOP_WORDS.has(word))
  );

const calculateIDF = (docs: string[][]): Vector => {
  const idf: Vector = {};
  const N = docs.length;

  const docFreq: Record<string, number> = {};
  for (const tokens of docs) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFreq[token] = (docFreq[token] || 0) + 1;
    }
  }

  // Calculate Inverse Document Frequency
  for (const [term, count] of Object.entries(docFreq)) {
    idf[term] = Math.log(N / (1 + count));
  }
  return idf;
};

const calculateTFIDF = (tokens: string[], idf: Vector): Vector => {
  const vec: Vector = {};
  // Calculate Term Frequency (TF)
  for (const token of tokens) {
    vec[token] = (vec[token] || 0) + 1;
  }
  // Multiply by IDF
  for (const term of Object.keys(vec)) {
    // If term exists in corpus IDF, use it, otherwise 0 (ignore unknown query terms)
    if (idf[term]) {
      vec[term] = vec[term] * idf[term];
    } else {
      delete vec[term]; // Remove noise
    }
  }
  return vec;
};

const getCosineSimilarity = (vecA: Vector, vecB: Vector): number => {

  const termsA = Object.keys(vecA);
  const termsB = Object.keys(vecB);

  if (termsA.length === 0 || termsB.length === 0) return 0;

  let dotProduct = 0;
  const [smaller, larger] = termsA.length < termsB.length ? [vecA, vecB] : [vecB, vecA];

  for (const term of Object.keys(smaller)) {
    if (larger[term]) {
      dotProduct += smaller[term] * larger[term];
    }
  }

  const magA = Math.sqrt(Object.values(vecA).reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(Object.values(vecB).reduce((acc, val) => acc + val * val, 0));

  if (magA === 0 || magB === 0) return 0;

  return dotProduct / (magA * magB);
};

export const createSearchIndex = (articles: Article[]) => {
  const docs = articles.map(a => tokenizeText(`${a.title} ${a.content}`));
  const idf = calculateIDF(docs);
  const articleVectors = docs.map(doc => calculateTFIDF(doc, idf));

  return (query: string, threshold = 0.05) => {
    const queryTokens = tokenizeText(query);
    if (queryTokens.length === 0) return [];

    const queryVector = calculateTFIDF(queryTokens, idf);

    return articles
      .map((article, index) => ({
        article,
        score: getCosineSimilarity(queryVector, articleVectors[index])
      }))
      .filter(result => result.score > threshold)
      .sort((a, b) => b.score - a.score);
  };
};


let index: ((query: string, threshold?: number) => { article: Article; score: number }[]) | null = null;
export const searchData = (articles: Article[], query: string) => {
  index ??= createSearchIndex(articles);
  return index(query);
};


export const generateGraphData = (articles: Article[], { threshold = 0.15 } = {}) => {
  const docs = articles.map(a => tokenizeText(`${a.title} ${a.content}`, true));
  const idf = calculateIDF(docs);
  const vectors = docs.map(doc => calculateTFIDF(doc, idf));

  const nodes = articles.map((article) => ({
    ...article,
    neighbors: [] as number[],
    size: 1
  }));

  const links = [];
  let maxSim = 0;

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const sim = getCosineSimilarity(vectors[i], vectors[j]);

      if (sim > threshold) {
        if (sim > maxSim) maxSim = sim;

        const commonWords = Object.keys(vectors[i]).filter(word => vectors[j][word]);

        links.push({
          source: i,
          target: j,
          similarity: sim,
          commonWords,
        });

        nodes[i].neighbors.push(j);
        nodes[j].neighbors.push(i);
      }
    }
  }

  // Adjust node size based on connectivity
  for (const node of nodes) {
    node.size = Math.max(2, Math.sqrt(node.neighbors.length) * 4);
  }

  return { nodes, links, maxSim };
};
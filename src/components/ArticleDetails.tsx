import { useMemo } from "react";
import { X, Search, FileText, Hash } from "lucide-react";

import type { ArticleNode } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ArticleDetailsProps {
  search: string;
  node: ArticleNode;
  onClose: () => void;
}

export function ArticleDetails({
  search,
  node,
  onClose,
}: Readonly<ArticleDetailsProps>) {
  const { processedContent, matchCount, activeTerms } = useMemo(() => {
    const terms = search
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);

    if (terms.length === 0) {
      return { processedContent: node.content, matchCount: 0, activeTerms: [] };
    }

    const safeTerms = terms.map((t) =>
      t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(`(${safeTerms.join("|")})`, "gi");

    const parts = node.content.split(regex);
    let count = 0;

    const content = parts.map((part, i) => {
      if (terms.includes(part.toLowerCase())) {
        count++;
        return (
          <mark
            key={i}
            className="bg-green-100 text-green-800 font-semibold px-0.5 rounded-sm"
          >
            {part}
          </mark>
        );
      }
      return part;
    });

    return { processedContent: content, matchCount: count, activeTerms: terms };
  }, [search, node.content]);

  return (
    <div className="absolute top-4 right-1 left-1 sm:left-auto sm:right-4 w-full max-w-md z-50 animate-in slide-in-from-right-10 fade-in duration-300">
      <Card className="shadow-2xl border-slate-200/60 bg-white/95 backdrop-blur-sm flex flex-col max-h-[85vh]">
        <CardHeader className="shrink-0 pb-3 bg-slate-50/50 rounded-t-xl border-b">
          <div className="flex items-center sm:items-start justify-between gap-4">
            <div className="space-y-1.5 w-full text-center md:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-mono text-slate-500"
                >
                  <Hash className="w-3 h-3 mr-1 inline" />
                  {node.id}
                </Badge>
                {matchCount > 0 && (
                  <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                    <Search className="w-3 h-3 mr-1" />
                    {matchCount} matches
                  </span>
                )}
              </div>

              <CardTitle className="text-xl font-bold leading-tight text-slate-900">
                {node.title}
              </CardTitle>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-700 shrink-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {activeTerms.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-2">
              {activeTerms.map((term) => (
                <span
                  key={term}
                  className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  {term}
                </span>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="overflow-y-auto p-6">
          <p className="text-sm text-slate-600 leading-7 whitespace-pre-wrap">
            {processedContent}
          </p>
        </CardContent>

        <Separator />

        <CardFooter className="shrink-0 bg-slate-50/50 py-3 px-6 rounded-b-xl">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <FileText className="w-3 h-3" /> Connection Logic
            </div>
            <p className="text-xs text-slate-400">
              Matches determined via TF-IDF Vectorization & Cosine Similarity.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

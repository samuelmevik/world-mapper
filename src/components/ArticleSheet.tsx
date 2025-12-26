import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, X } from "lucide-react";
import type { Article } from "@/types";
import { cn } from "@/lib/utils";

interface ArticleSheetProps {
  articles: { article: Article; score: number }[];
  onClose: () => void;
  onArticleClick: (id: number | string) => void;
}

const ArticleSheet = ({
  articles,
  onClose,
  onArticleClick,
}: ArticleSheetProps) => {
  const [height, setHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newHeight = window.innerHeight - e.clientY;

      const constrainedHeight = Math.max(150, Math.min(newHeight, window.innerHeight - 20));

      setHeight(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, transition: isDragging ? 'none' : 'height 0.2s ease-out' }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex flex-col",
        "bg-background border-t shadow-[0_-5px_40px_-10px_rgba(0,0,0,0.2)]",
        "rounded-t-xl"
      )}
    >
      <div
        className="w-full flex items-center justify-center pt-3 pb-1 cursor-ns-resize touch-none hover:bg-muted/50 transition-colors rounded-t-xl"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      >
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
      </div>

      <div className="px-6 pb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Related Articles
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Found {articles.length} results based on context.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>


      <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
        <ScrollArea className="h-full w-full pr-4">
          <div className="flex flex-col gap-2 pb-2">
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <FileText className="h-8 w-8 opacity-20" />
                <p className="text-sm">No articles found.</p>
              </div>
            ) : (
              articles.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onArticleClick(item.article.id)}
                  className={cn(
                    "group flex items-center justify-between w-full p-3 rounded-lg border bg-card text-card-foreground",
                    "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                    "text-left"
                  )}
                >
                  <div className="flex flex-col items-start gap-1 min-w-0 flex-1 mr-4">
                    <span className="font-medium truncate w-full text-sm sm:text-base">
                      {item.article.title}
                    </span>
                    <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">
                      Tap to view details
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={item.score > 0.7 ? "default" : "secondary"}
                      className="whitespace-nowrap font-normal"
                    >
                      {Math.round(item.score * 100)}%
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ArticleSheet;
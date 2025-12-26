import { useState } from "react";
import { MessageCircle, X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LocalAIChat from "./Chat";
import { cn } from "@/lib/utils";
import { model } from "@/model";

export function ChatWrapper({
  onBadgeClick,
}: {
  onBadgeClick: (id: number | string) => void;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  return (
    <div className="absolute top-4 left-1 sm:left-4 z-50 flex flex-col items-start gap-4 font-sans">
      <Button
        onClick={toggleChat}
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300 ease-in-out",
          "bg-linear-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500",
          "border-2 border-white/20 ring-offset-2 focus:ring-2 focus:ring-violet-500",
          isChatOpen ? "rotate-90 scale-105" : "hover:scale-110"
        )}
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle
            className={cn(
              "absolute h-7 w-7 text-white transition-all duration-300",
              isChatOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <X
            className={cn(
              "absolute h-7 w-7 text-white transition-all duration-300",
              isChatOpen
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0 -rotate-90"
            )}
          />
        </div>
        <span className="sr-only">Toggle AI Assistant</span>
      </Button>

      {isChatOpen && (
        <div className="animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-300 origin-top-left w-full max-w-md">
          <Card className="flex flex-col max-h-[50vh] w-95 sm:w-112.5 shadow-2xl border-slate-200 bg-white/95 backdrop-blur-md overflow-hidden rounded-2xl ring-1 ring-black/5">
            <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    Dumb-bot 800{" "}
                    <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-normal text-slate-500">
                      {model}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Always here to help or crash your browser
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full"
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50/30">
              <LocalAIChat onBadgeClick={onBadgeClick} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

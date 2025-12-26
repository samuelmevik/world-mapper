import {
  Search,
  FileText,
  Network,
  ScanSearch,
  Settings2,
  ChevronDown,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  nodeCount: number;
  linkCount: number;
  setData: ({ threshold }: { threshold?: number }) => void;
  setMode: (mode: "2d" | "3d") => void;
  zoomToSearchExtent: () => void;
  setIsSheetOpen: (prev: boolean | ((prev: boolean) => boolean)) => void;
}

export function Header({
  search,
  onSearchChange,
  nodeCount,
  linkCount,
  setData,
  setMode,
  zoomToSearchExtent,
  setIsSheetOpen,
}: Readonly<HeaderProps>) {
  const [threshold, setThreshold] = useState([0.15]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleThresholdChange = (value: number[]) => {
    setThreshold(value);
    setData({ threshold: value[0] });
  };

  return (
    <header className="px-4 md:px-6 py-3 border-b bg-card/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between z-10 shadow-sm sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-2 w-full md:flex-1 md:max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background/50 focus:bg-background transition-colors w-full"
          />
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomToSearchExtent}
                  disabled={!search}
                  className="shrink-0"
                >
                  <ScanSearch className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom to search results</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSheetOpen(prev => !prev)}
                  className="shrink-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open details sheet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Settings2 className="h-5 w-5" />
            )}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8 mx-2 hidden md:block" />

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-3 min-w-50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings2 className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Link Threshold</span>
            </div>
            <Slider
              value={threshold}
              min={0}
              max={0.2}
              step={0.005}
              onValueChange={handleThresholdChange}
              className="w-24"
            />
            <span className="text-xs font-mono tabular-nums text-muted-foreground w-8">
              {threshold[0].toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="mode-toggle-desktop"
              onCheckedChange={(checked) => setMode(checked ? "3d" : "2d")}
            />
            <Label htmlFor="mode-toggle-desktop" className="font-normal cursor-pointer text-muted-foreground">
              3D View
            </Label>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 pl-4">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 h-8 font-normal">
          <FileText className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-semibold text-foreground">{nodeCount}</span>
          <span className="text-muted-foreground">Nodes</span>
        </Badge>

        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 h-8 font-normal">
          <Network className="h-3.5 w-3.5 text-violet-500" />
          <span className="font-semibold text-foreground">{linkCount}</span>
          <span className="text-muted-foreground">Links</span>
        </Badge>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden pt-4 pb-2 space-y-4 animate-in slide-in-from-top-2">
          <Separator />

          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Link Threshold
              </span>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {threshold[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={threshold}
              min={0}
              max={0.2}
              step={0.005}
              onValueChange={handleThresholdChange}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <Label htmlFor="mode-toggle-mobile" className="font-medium">
              3D View Mode
            </Label>
            <Switch
              id="mode-toggle-mobile"
              onCheckedChange={(checked) => setMode(checked ? "3d" : "2d")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Badge variant="secondary" className="flex-1 justify-center gap-1.5 py-1.5 font-normal">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-semibold">{nodeCount}</span> Nodes
            </Badge>
            <Badge variant="secondary" className="flex-1 justify-center gap-1.5 py-1.5 font-normal">
              <Network className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-semibold">{linkCount}</span> Links
            </Badge>
          </div>
        </div>
      )}
    </header>
  );
}
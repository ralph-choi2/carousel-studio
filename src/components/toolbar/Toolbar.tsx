import { Download, Loader2, Save } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ToolbarProps {
  files: string[];
  currentFile: string | null;
  onFileSelect: (filename: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isDirty: boolean;
  onSave: () => void;
  onExport: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
}

export function Toolbar({
  files,
  currentFile,
  onFileSelect,
  zoom,
  onZoomChange,
  isDirty,
  onSave,
  onExport,
  isSaving = false,
  isExporting = false,
}: ToolbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab =
    location.pathname === "/component" ? "component" : "editor";

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b bg-background">
      {/* Brand */}
      <span className="font-bold text-sm shrink-0">Carousel Studio</span>

      {/* File selector */}
      <Select value={currentFile ?? ""} onValueChange={onFileSelect}>
        <SelectTrigger className="w-[280px] h-8 text-xs bg-accent/30">
          <SelectValue placeholder="Select a file..." />
        </SelectTrigger>
        <SelectContent>
          {files.map((file) => (
            <SelectItem key={file} value={file} className="text-xs">
              {file}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tab navigation */}
      <Tabs
        value={currentTab}
        onValueChange={(value) => navigate(`/${value}`)}
      >
        <TabsList className="h-8">
          <TabsTrigger value="editor" className="text-xs px-3 py-1">
            Editor
          </TabsTrigger>
          <TabsTrigger value="component" className="text-xs px-3 py-1">
            Component
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground w-9 text-right">
          {zoom}%
        </span>
        <Slider
          min={20}
          max={100}
          step={5}
          value={[zoom]}
          onValueChange={([val]) => onZoomChange(val)}
          className="w-24"
        />
      </div>

      {/* Save button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onSave}
        disabled={!isDirty || isSaving}
        className="shrink-0"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Save />
        )}
        Save
      </Button>

      {/* Export button */}
      <Button
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isExporting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Download />
        )}
        Export
      </Button>
    </div>
  );
}

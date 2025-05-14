
import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WeddingTask } from "@/hooks/useWeddingTasks";
import { cn } from "@/lib/utils";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: WeddingTask | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<WeddingTask | null>>;
  timelines: string[];
  categories: string[];
  onSave: () => void;
}

const TaskDetailsDialog = ({ 
  open, 
  onOpenChange, 
  selectedTask, 
  setSelectedTask, 
  timelines, 
  categories,
  onSave 
}: TaskDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-wedding-navy">
            Dettagli attività
          </DialogTitle>
          <DialogDescription>
            Visualizza e modifica i dettagli dell'attività
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titolo</Label>
            <Input
              id="edit-title"
              value={selectedTask?.title || ""}
              onChange={(e) => setSelectedTask(prev => 
                prev ? { ...prev, title: e.target.value } : null
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrizione</Label>
            <Textarea
              id="edit-description"
              value={selectedTask?.description || ""}
              onChange={(e) => setSelectedTask(prev => 
                prev ? { ...prev, description: e.target.value } : null
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-timeline">Timeline</Label>
              <select
                id="edit-timeline"
                value={selectedTask?.timeline || ""}
                onChange={(e) => setSelectedTask(prev => 
                  prev ? { ...prev, timeline: e.target.value } : null
                )}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                {timelines.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <select
                id="edit-category"
                value={selectedTask?.category || ""}
                onChange={(e) => setSelectedTask(prev => 
                  prev ? { ...prev, category: e.target.value } : null
                )}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                {categories.slice(1).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Data scadenza</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedTask?.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedTask?.dueDate ? (
                    format(new Date(selectedTask.dueDate), "PP")
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedTask?.dueDate ? new Date(selectedTask.dueDate) : undefined}
                  onSelect={(date) => setSelectedTask(prev => 
                    prev ? { ...prev, dueDate: date?.toISOString() || prev.dueDate } : null
                  )}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={selectedTask?.notes || ""}
              onChange={(e) => setSelectedTask(prev => 
                prev ? { ...prev, notes: e.target.value } : null
              )}
              placeholder="Aggiungi note o appunti..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button 
            onClick={onSave}
            className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
          >
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;


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

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTask: Partial<WeddingTask>;
  setNewTask: React.Dispatch<React.SetStateAction<Partial<WeddingTask>>>;
  timelines: string[];
  categories: string[];
  onAddTask: () => void;
}

const AddTaskDialog = ({
  open,
  onOpenChange,
  newTask,
  setNewTask,
  timelines,
  categories,
  onAddTask
}: AddTaskDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-wedding-navy">
            Aggiungi nuova attività
          </DialogTitle>
          <DialogDescription>
            Aggiungi un'attività personalizzata alla tua checklist
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Es. Prenotare il fotografo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Descrivi brevemente questa attività..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <select
                id="timeline"
                value={newTask.timeline}
                onChange={(e) => setNewTask({ ...newTask, timeline: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Seleziona periodo</option>
                {timelines.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
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
                    !newTask.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTask.dueDate ? (
                    format(new Date(newTask.dueDate), "PP")
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                  onSelect={(date) => setNewTask({ ...newTask, dueDate: date?.toISOString() })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
            onClick={onAddTask}
            className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
            disabled={!newTask.title}
          >
            Aggiungi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;

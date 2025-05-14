
import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowDown, 
  ArrowUp 
} from "lucide-react";

interface AddTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timelineName: string;
  setTimelineName: React.Dispatch<React.SetStateAction<string>>;
  onAddTimeline: () => void;
}

export const AddTimelineDialog = ({
  open,
  onOpenChange,
  timelineName,
  setTimelineName,
  onAddTimeline
}: AddTimelineDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-wedding-navy">
            Aggiungi nuova timeline
          </DialogTitle>
          <DialogDescription>
            Crea una timeline personalizzata per organizzare le tue attività
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="timeline-name">Nome timeline</Label>
            <Input
              id="timeline-name"
              value={timelineName}
              onChange={(e) => setTimelineName(e.target.value)}
              placeholder="Es. 2 anni prima"
              required
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
            onClick={onAddTimeline}
            className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
            disabled={!timelineName.trim()}
          >
            Aggiungi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timelines: string[];
  onRemoveTimeline: (timeline: string) => void;
  onMoveTimeline: (timeline: string, direction: 'up' | 'down') => void;
}

export const EditTimelineDialog = ({
  open,
  onOpenChange,
  timelines,
  onRemoveTimeline,
  onMoveTimeline
}: EditTimelineDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-wedding-navy">
            Gestisci timeline
          </DialogTitle>
          <DialogDescription>
            Visualizza e modifica le tue timeline personalizzate
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto">
          {timelines.map((timeline, index) => (
            <div key={timeline} className="flex justify-between items-center border-b pb-2">
              <span>{timeline}</span>
              <div className="flex gap-1 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={() => onMoveTimeline(timeline, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={() => onMoveTimeline(timeline, 'down')}
                  disabled={index === timelines.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemoveTimeline(timeline)}
                >
                  Rimuovi
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import React from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChecklistHeaderProps {
  onAddTimelineClick: () => void;
  onEditTimelineClick: () => void;
  onAddTaskClick: () => void;
}

const ChecklistHeader = ({ 
  onAddTimelineClick, 
  onEditTimelineClick, 
  onAddTaskClick 
}: ChecklistHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-wedding-navy">
          La tua Checklist
        </h1>
        <p className="text-gray-500">
          Gestisci e tieni traccia delle attività per il tuo matrimonio
        </p>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={onAddTimelineClick}
          variant="outline"
          className="text-wedding-navy border-wedding-blush hover:bg-wedding-blush/10"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuova Timeline
        </Button>
        <Button 
          onClick={onEditTimelineClick}
          variant="outline"
          className="text-wedding-navy border-wedding-blush hover:bg-wedding-blush/10"
        >
          <Pencil className="mr-2 h-4 w-4" /> Gestisci Timeline
        </Button>
        <Button 
          onClick={onAddTaskClick}
          className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Aggiungi attività
        </Button>
      </div>
    </div>
  );
};

export default ChecklistHeader;

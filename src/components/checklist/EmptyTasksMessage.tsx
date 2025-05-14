
import React from "react";
import { Check, CheckCircle } from "lucide-react";

interface EmptyTasksMessageProps {
  isCompleted: boolean;
  selectedCategory: string;
}

const EmptyTasksMessage = ({ isCompleted, selectedCategory }: EmptyTasksMessageProps) => {
  return (
    <div className="text-center py-12">
      {isCompleted ? (
        <>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Check className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Nessuna attività completata
          </h3>
          <p className="mt-1 text-gray-500">
            {selectedCategory !== "Tutti" 
              ? `Non hai ancora completato attività nella categoria ${selectedCategory}.` 
              : "Inizia a spuntare le attività della tua checklist."}
          </p>
        </>
      ) : (
        <>
          <CheckCircle className="h-12 w-12 text-wedding-sage mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Nessuna attività da completare
          </h3>
          <p className="mt-1 text-gray-500">
            {selectedCategory !== "Tutti" 
              ? `Non ci sono attività nella categoria ${selectedCategory} da completare.` 
              : "Hai completato tutte le tue attività! Ottimo lavoro!"}
          </p>
        </>
      )}
    </div>
  );
};

export default EmptyTasksMessage;


import React from "react";

export const EmptyTableDisplay = () => {
  return (
    <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg p-6 bg-gray-50">
      <div className="text-center">
        <p className="text-gray-500 mb-2">Nessun tavolo disponibile</p>
        <p className="text-gray-400 text-sm">Aggiungi dei tavoli per iniziare</p>
      </div>
    </div>
  );
};

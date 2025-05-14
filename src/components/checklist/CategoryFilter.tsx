
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="mb-6 overflow-x-auto pb-3">
      <div className="flex space-x-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={cn(
              "whitespace-nowrap",
              selectedCategory === category 
                ? "bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90" 
                : "hover:bg-wedding-blush/10 hover:text-wedding-navy"
            )}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;


import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useChecklistState } from "@/hooks/useChecklistState";
import CategoryFilter from "@/components/checklist/CategoryFilter";
import TaskList from "@/components/checklist/TaskList";
import ChecklistHeader from "@/components/checklist/ChecklistHeader";
import ChecklistDialogs from "@/components/checklist/ChecklistDialogs";
import { categories } from "@/utils/checklistCategories";

const ChecklistPage = () => {
  const {
    // Data
    timelines,
    tasksByTimeline,
    
    // State
    activeTab,
    selectedCategory,
    taskDetailsOpen,
    selectedTask,
    isAddTaskOpen,
    isAddTimelineOpen,
    newTimelineName,
    isEditTimelineOpen,
    newTask,
    
    // Setters
    setActiveTab,
    setSelectedCategory,
    setTaskDetailsOpen,
    setSelectedTask,
    setIsAddTaskOpen,
    setIsAddTimelineOpen,
    setNewTimelineName,
    setIsEditTimelineOpen,
    setNewTask,
    
    // Handlers
    handleDragEnd,
    handleTaskClick,
    handleToggleComplete,
    handleSaveTask,
    handleAddTask,
    handleAddTimeline,
    handleRemoveTimeline,
    handleMoveTimeline
  } = useChecklistState();
  
  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <ChecklistHeader 
          onAddTimelineClick={() => setIsAddTimelineOpen(true)}
          onEditTimelineClick={() => setIsEditTimelineOpen(true)}
          onAddTaskClick={() => setIsAddTaskOpen(true)}
        />
        
        {/* Category filter */}
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        {/* Tasks list with tabs */}
        <TaskList 
          timelines={timelines}
          tasksByTimeline={tasksByTimeline}
          activeTab={activeTab}
          selectedCategory={selectedCategory}
          onTabChange={setActiveTab}
          onDragEnd={handleDragEnd}
          onToggleComplete={handleToggleComplete}
          onTaskClick={handleTaskClick}
          onMoveTimeline={handleMoveTimeline}
        />
      </div>
      
      {/* Dialogs/Modals */}
      <ChecklistDialogs 
        taskDetailsOpen={taskDetailsOpen}
        setTaskDetailsOpen={setTaskDetailsOpen}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        timelines={timelines}
        categories={categories}
        onSaveTask={handleSaveTask}
        
        isAddTaskOpen={isAddTaskOpen}
        setIsAddTaskOpen={setIsAddTaskOpen}
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={handleAddTask}
        
        isAddTimelineOpen={isAddTimelineOpen}
        setIsAddTimelineOpen={setIsAddTimelineOpen}
        newTimelineName={newTimelineName}
        setNewTimelineName={setNewTimelineName}
        onAddTimeline={handleAddTimeline}
        
        isEditTimelineOpen={isEditTimelineOpen}
        setIsEditTimelineOpen={setIsEditTimelineOpen}
        onRemoveTimeline={handleRemoveTimeline}
        onMoveTimeline={handleMoveTimeline}
      />
    </MainLayout>
  );
};

export default ChecklistPage;

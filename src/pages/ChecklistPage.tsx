import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Check, Calendar, CheckCircle, Pencil, GripVertical } from "lucide-react";
import { useWeddingTasks, WeddingTask } from "@/hooks/useWeddingTasks";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

// Task categories
const categories = [
  "Tutti",
  "Pianificazione",
  "Location",
  "Fornitori",
  "Abbigliamento",
  "Inviti",
  "Ricevimento",
  "Cerimonia",
  "Regali",
  "Viaggio",
  "Intrattenimento",
  "Budget",
  "Altro"
];

const ChecklistPage = () => {
  const { 
    tasks, 
    timelines, 
    updateTask, 
    addTask, 
    reorderTasks, 
    addTimeline, 
    removeTimeline 
  } = useWeddingTasks();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for filters and modals
  const [activeTab, setActiveTab] = useState("da-fare");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WeddingTask | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState("");
  const [isEditTimelineOpen, setIsEditTimelineOpen] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [newTask, setNewTask] = useState<Partial<WeddingTask>>({
    title: "",
    description: "",
    timeline: "",
    dueDate: new Date().toISOString(),
    category: "Altro",
    completed: false
  });
  
  // Filter tasks based on active tab and category
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === "da-fare" ? !task.completed : task.completed;
    const matchesCategory = selectedCategory === "Tutti" || task.category === selectedCategory;
    return matchesTab && matchesCategory;
  });
  
  // Group tasks by timeline
  const tasksByTimeline: Record<string, WeddingTask[]> = {};
  
  // Initialize empty arrays for all timelines
  timelines.forEach(timeline => {
    tasksByTimeline[timeline] = [];
  });
  
  // Populate with filtered tasks
  filteredTasks.forEach(task => {
    // If the task's timeline exists in our timelines array, add it
    if (timelines.includes(task.timeline)) {
      tasksByTimeline[task.timeline].push(task);
    } else {
      // If the timeline doesn't exist (possibly a legacy task),
      // add it to "Altro" or create a new timeline
      if (!tasksByTimeline["Altro"]) {
        tasksByTimeline["Altro"] = [];
      }
      tasksByTimeline["Altro"].push(task);
    }
  });
  
  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Drop outside a valid area or drop in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get task ID and update its timeline
    const taskId = draggableId;
    const newTimeline = destination.droppableId;
    
    reorderTasks(taskId, newTimeline);
    
    toast({
      title: "Attività spostata",
      description: `L'attività è stata spostata in "${newTimeline}"`,
      duration: 3000,
    });
  };
  
  const handleTaskClick = (task: WeddingTask) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };
  
  const handleToggleComplete = (task: WeddingTask, completed: boolean) => {
    updateTask(task.id, { completed });
  };
  
  const handleSaveTask = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, { 
        notes: selectedTask.notes,
        title: selectedTask.title,
        description: selectedTask.description,
        timeline: selectedTask.timeline,
        dueDate: selectedTask.dueDate,
        category: selectedTask.category
      });
      
      toast({
        title: "Attività aggiornata",
        description: "Le modifiche sono state salvate con successo",
        duration: 3000,
      });
    }
    setTaskDetailsOpen(false);
  };
  
  const handleAddTask = () => {
    if (!newTask.title) return;
    
    addTask({
      title: newTask.title,
      description: newTask.description || "",
      timeline: newTask.timeline || timelines[0],
      dueDate: newTask.dueDate || new Date().toISOString(),
      category: newTask.category || "Altro",
      completed: false,
    });
    
    toast({
      title: "Attività aggiunta",
      description: `"${newTask.title}" è stata aggiunta alla tua checklist`,
      duration: 3000,
    });
    
    // Reset form
    setNewTask({
      title: "",
      description: "",
      timeline: "",
      dueDate: new Date().toISOString(),
      category: "Altro",
      completed: false
    });
    
    setIsAddTaskOpen(false);
  };
  
  const handleAddTimeline = () => {
    if (!newTimelineName.trim()) return;
    
    addTimeline(newTimelineName.trim());
    
    toast({
      title: "Timeline aggiunta",
      description: `"${newTimelineName}" è stata aggiunta alle tue timeline`,
      duration: 3000,
    });
    
    setNewTimelineName("");
    setIsAddTimelineOpen(false);
  };
  
  const handleRemoveTimeline = (timeline: string) => {
    const success = removeTimeline(timeline);
    
    if (success) {
      toast({
        title: "Timeline rimossa",
        description: `"${timeline}" è stata rimossa dalle tue timeline`,
        duration: 3000,
      });
      setIsEditTimelineOpen(false);
    } else {
      toast({
        title: "Impossibile rimuovere la timeline",
        description: "Ci sono ancora attività associate a questa timeline",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
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
              onClick={() => setIsAddTimelineOpen(true)}
              variant="outline"
              className="text-wedding-navy border-wedding-blush hover:bg-wedding-blush/10"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuova Timeline
            </Button>
            <Button 
              onClick={() => setIsEditTimelineOpen(true)}
              variant="outline"
              className="text-wedding-navy border-wedding-blush hover:bg-wedding-blush/10"
            >
              <Pencil className="mr-2 h-4 w-4" /> Gestisci Timeline
            </Button>
            <Button 
              onClick={() => setIsAddTaskOpen(true)}
              className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Aggiungi attività
            </Button>
          </div>
        </div>
        
        {/* Category filter */}
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
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Tabs for completed/incomplete */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="da-fare">Da fare</TabsTrigger>
            <TabsTrigger value="completate">Completate</TabsTrigger>
          </TabsList>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <TabsContent value="da-fare" className="mt-6">
              {timelines.filter(timeline => tasksByTimeline[timeline]?.length > 0).length > 0 ? (
                timelines.map(timeline => (
                  tasksByTimeline[timeline]?.length > 0 && (
                    <Droppable droppableId={timeline} key={timeline}>
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="mb-8"
                        >
                          <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy flex items-center">
                            {timeline}
                          </h3>
                          <div className="space-y-3">
                            {tasksByTimeline[timeline]?.map((task, index) => (
                              <Draggable 
                                key={task.id} 
                                draggableId={task.id} 
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "task-item upcoming border border-transparent",
                                      snapshot.isDragging ? "border-wedding-blush shadow-lg" : ""
                                    )}
                                  >
                                    <div className="flex items-start">
                                      <div 
                                        className="flex-shrink-0 pt-1 px-2 cursor-move text-gray-400 hover:text-wedding-navy"
                                        {...provided.dragHandleProps}
                                      >
                                        <GripVertical size={16} />
                                      </div>
                                      <div className="flex-shrink-0 pt-1 pr-4" onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleComplete(task, !task.completed);
                                      }}>
                                        <Checkbox
                                          checked={task.completed}
                                          className="border-wedding-blush data-[state=checked]:bg-wedding-blush data-[state=checked]:border-wedding-blush"
                                        />
                                      </div>
                                      <div 
                                        className="flex-1 cursor-pointer"
                                        onClick={() => handleTaskClick(task)}
                                      >
                                        <h4 className="font-medium text-wedding-navy">{task.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                        <div className="flex items-center mt-2 text-xs text-gray-500">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          <span>{new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>
                                          {task.category && (
                                            <>
                                              <span className="mx-2">•</span>
                                              <span>{task.category}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  )
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-wedding-sage mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Nessuna attività da completare
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {selectedCategory !== "Tutti" 
                      ? `Non ci sono attività nella categoria ${selectedCategory} da completare.` 
                      : "Hai completato tutte le tue attività! Ottimo lavoro!"}
                  </p>
                </div>
              )}
            </TabsContent>
          
            <TabsContent value="completate" className="mt-6">
              {timelines.filter(timeline => tasksByTimeline[timeline]?.length > 0).length > 0 ? (
                timelines.map(timeline => (
                  tasksByTimeline[timeline]?.length > 0 && (
                    <div key={timeline} className="mb-8">
                      <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy">
                        {timeline}
                      </h3>
                      <div className="space-y-3">
                        {tasksByTimeline[timeline]?.map(task => (
                          <div 
                            key={task.id} 
                            className="task-item completed"
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-1 pr-4" onClick={(e) => {
                                e.stopPropagation();
                                handleToggleComplete(task, !task.completed);
                              }}>
                                <Checkbox
                                  checked={task.completed}
                                  className="border-wedding-sage data-[state=checked]:bg-wedding-sage data-[state=checked]:border-wedding-sage"
                                />
                              </div>
                              <div className="flex-1 cursor-pointer">
                                <h4 className="font-medium text-gray-500 line-through">{task.title}</h4>
                                <p className="text-sm text-gray-400 mt-1 line-through">{task.description}</p>
                                <div className="flex items-center mt-2 text-xs text-wedding-sage">
                                  <Check className="h-3 w-3 mr-1" />
                                  <span>Completato</span>
                                  {task.category && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span>{task.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="text-center py-12">
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
                </div>
              )}
            </TabsContent>
          </DragDropContext>
        </Tabs>
      </div>
      
      {/* Task Details Dialog (Expanded with editing capabilities) */}
      <Dialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
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
                  <CalendarComponent
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
              onClick={() => setTaskDetailsOpen(false)}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSaveTask}
              className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
            >
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
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
                  <CalendarComponent
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
              onClick={() => setIsAddTaskOpen(false)}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleAddTask}
              className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
              disabled={!newTask.title}
            >
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Timeline Dialog */}
      <Dialog open={isAddTimelineOpen} onOpenChange={setIsAddTimelineOpen}>
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
                value={newTimelineName}
                onChange={(e) => setNewTimelineName(e.target.value)}
                placeholder="Es. 2 anni prima"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddTimelineOpen(false)}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleAddTimeline}
              className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
              disabled={!newTimelineName.trim()}
            >
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Timelines Dialog */}
      <Dialog open={isEditTimelineOpen} onOpenChange={setIsEditTimelineOpen}>
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
            {timelines.map(timeline => (
              <div key={timeline} className="flex justify-between items-center border-b pb-2">
                <span>{timeline}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveTimeline(timeline)}
                >
                  Rimuovi
                </Button>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditTimelineOpen(false)}
            >
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ChecklistPage;

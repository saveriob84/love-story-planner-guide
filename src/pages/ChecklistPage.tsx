import { useState } from "react";
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
import { CalendarIcon, Plus, Check, Calendar, CheckCircle } from "lucide-react";
import { useWeddingTasks, WeddingTask } from "@/hooks/useWeddingTasks";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Timeline periods for grouping tasks
const timelines = [
  "12+ mesi prima",
  "10-12 mesi prima",
  "8-10 mesi prima",
  "6-8 mesi prima",
  "4-6 mesi prima",
  "2-4 mesi prima",
  "1-2 mesi prima",
  "1-2 settimane prima",
  "Ultimi giorni"
];

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
  const { tasks, updateTask, addTask } = useWeddingTasks();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for filters and modal
  const [activeTab, setActiveTab] = useState("da-fare");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WeddingTask | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
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
  const tasksByTimeline = timelines.reduce((acc, timeline) => {
    const timelineTasks = filteredTasks.filter(task => task.timeline === timeline);
    if (timelineTasks.length > 0) {
      acc[timeline] = timelineTasks;
    }
    return acc;
  }, {} as Record<string, WeddingTask[]>);
  
  // Get all unique timelines from filtered tasks
  const availableTimelines = Object.keys(tasksByTimeline).sort((a, b) => {
    // Custom sort to maintain chronological order
    const timelineOrder = timelines.indexOf(a) - timelines.indexOf(b);
    return timelineOrder;
  });
  
  const handleTaskClick = (task: WeddingTask) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };
  
  const handleToggleComplete = (task: WeddingTask, completed: boolean) => {
    updateTask(task.id, { completed });
  };
  
  const handleSaveNotes = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, { notes: selectedTask.notes });
    }
    setTaskDetailsOpen(false);
  };
  
  const handleAddTask = () => {
    if (!newTask.title) return;
    
    addTask({
      title: newTask.title,
      description: newTask.description || "",
      timeline: newTask.timeline || "Altro",
      dueDate: newTask.dueDate || new Date().toISOString(),
      category: newTask.category || "Altro",
      completed: false,
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
          <Button 
            onClick={() => setIsAddTaskOpen(true)}
            className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Aggiungi attività
          </Button>
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
          
          <TabsContent value="da-fare" className="mt-6">
            {availableTimelines.length > 0 ? (
              availableTimelines.map(timeline => (
                <div key={timeline} className="mb-8">
                  <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy">
                    {timeline}
                  </h3>
                  <div className="space-y-3">
                    {tasksByTimeline[timeline].map(task => (
                      <div 
                        key={task.id} 
                        className="task-item upcoming"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-1 pr-4" onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task, !task.completed);
                          }}>
                            <Checkbox
                              checked={task.completed}
                              className="border-wedding-blush data-[state=checked]:bg-wedding-blush data-[state=checked]:border-wedding-blush"
                            />
                          </div>
                          <div className="flex-1 cursor-pointer">
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
                    ))}
                  </div>
                </div>
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
            {availableTimelines.length > 0 ? (
              availableTimelines.map(timeline => (
                <div key={timeline} className="mb-8">
                  <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy">
                    {timeline}
                  </h3>
                  <div className="space-y-3">
                    {tasksByTimeline[timeline].map(task => (
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
        </Tabs>
      </div>
      
      {/* Task Details Dialog */}
      <Dialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-navy">
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedTask?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Timeline</Label>
                <p className="text-sm font-medium">{selectedTask?.timeline}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Data</Label>
                <p className="text-sm font-medium">
                  {selectedTask?.dueDate && new Date(selectedTask.dueDate).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-gray-500">Categoria</Label>
              <p className="text-sm font-medium">{selectedTask?.category}</p>
            </div>
            
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={selectedTask?.notes || ""}
                onChange={(e) => setSelectedTask(prev => 
                  prev ? { ...prev, notes: e.target.value } : null
                )}
                placeholder="Aggiungi note o appunti..."
                className="mt-1"
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
              onClick={handleSaveNotes}
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
    </MainLayout>
  );
};

export default ChecklistPage;

'use client';

import { useEffect, useState } from 'react';
import { useTaskStore, Task } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { Plus, Timer, Calendar as CalendarIcon, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { HabitNav } from '@/components/HabitNav';

export default function HabitsPage() {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, isLoading } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [fetchTasks, fetchCategories]);

  useEffect(() => {
    if (editingTask) {
       setTitle(editingTask.title);
       setDescription(editingTask.description || '');
       setCategory(typeof editingTask.category === 'object' ? editingTask.category?._id || '' : editingTask.category || '');
       setDifficulty(editingTask.difficulty);
       setStartDate(editingTask.startDate ? format(new Date(editingTask.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
       setEndDate(editingTask.endDate ? format(new Date(editingTask.endDate), 'yyyy-MM-dd') : '');
    } else {
       resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setDifficulty('Medium');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
        toast.error('Title is required');
        return;
    }

    const taskData = {
        title,
        description,
        category: category || null,
        difficulty,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
    };

    try {
        if (editingTask) {
            await updateTask(editingTask._id, taskData);
            toast.success('Habit updated');
        } else {
            await createTask(taskData);
            toast.success('Habit created');
        }
        setIsDialogOpen(false);
        setEditingTask(null);
        resetForm();
    } catch (error) {
        toast.error('Failed to save habit');
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this habit?')) {
        try {
            await deleteTask(id);
            toast.success('Habit deleted');
        } catch(error) {
            toast.error('Failed to delete habit');
        }
    }
  }

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Daily Habits</h1>
            <p className="text-muted-foreground">Manage your routines and tasks.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if(!open) setEditingTask(null);
        }}>
            <DialogTrigger asChild>
                <Button onClick={() =>  setEditingTask(null)}>
                    <Plus className="mr-2 h-4 w-4" /> New Habit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingTask ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
                    <DialogDescription>
                        Define your habit details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Read 30 mins" />
                    </div>
                    
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Difficulty</label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">End Date (Optional)</label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <DialogFooter>
                         <Button type="submit" disabled={isLoading}>
                            {editingTask ? 'Update Habit' : 'Create Habit'}
                         </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <HabitNav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
            <Card key={task._id} className="relative group hover:shadow-md transition-all">
                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(task._id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <CardHeader>
                    <div className="flex justify-between items-start pr-8">
                         <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                        <span className={`px-2 py-1 rounded-full font-medium border ${
                             task.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                             task.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' :
                             'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {task.difficulty}
                        </span>
                        {task.category && (
                            <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-secondary">
                                {typeof task.category === 'object' ? task.category.name : 'Uncategorized'}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(task.startDate), 'MMM d, yyyy')} 
                        {task.endDate ? ` - ${format(new Date(task.endDate), 'MMM d, yyyy')}` : ' - Forever'}
                    </div>
                </CardContent>
            </Card>
        ))}
         {tasks.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                <p>No habits found. Create one to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
}

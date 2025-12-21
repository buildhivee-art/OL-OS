'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSettingsStore, Currency } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useContentStore } from '@/stores/contentStore';
import { useNoteStore } from '@/stores/noteStore';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { 
  User, 
  Settings2, 
  Palette, 
  Database, 
  Bell, 
  Shield, 
  LogOut, 
  Download, 
  Trash2,
  Moon,
  Sun,
  Laptop,
  CreditCard,
  Smartphone,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, notifications, sound, toggleNotifications, toggleSound, weekStart, setWeekStart } = useSettingsStore();
  const { user, logout, updateProfile } = useAuthStore();
  
  // Data Stores for Export
  const taskStore = useTaskStore();
  const financeStore = useFinanceStore();
  const workoutStore = useWorkoutStore();
  const contentStore = useContentStore();
  const noteStore = useNoteStore();

  const [activeTab, setActiveTab] = useState("general");
  const [exporting, setExporting] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  useEffect(() => {
    if (user) {
        if (user.name !== profileName) setIsProfileChanged(true);
        else if (user.email !== profileEmail) setIsProfileChanged(true);
        else setIsProfileChanged(false);
    }
  }, [profileName, profileEmail, user]);

  const handleProfileUpdate = async () => {
      try {
          await updateProfile({ name: profileName, email: profileEmail });
          toast.success("Profile updated");
          setIsProfileChanged(false);
      } catch (error) {
          toast.error("Failed to update profile");
      }
  };

  const handleExportData = async () => {
      setExporting(true);
      try {
          const exportData = {
              user: user,
              timestamp: new Date().toISOString(),
              data: {
                  tasks: taskStore.tasks,
                  finance: {
                      transactions: financeStore.transactions,
                      goals: financeStore.goals,
                      budgets: financeStore.budgets,
                      debts: financeStore.debts
                  },
                  fitness: {
                      workouts: workoutStore.workouts,
                      routines: workoutStore.routines
                  },
                  content: contentStore.contents,
                  notes: noteStore.notes
              }
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ol-os-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success("Data export started");
      } catch (error) {
          toast.error("Export failed");
          console.error(error);
      } finally {
          setExporting(false);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <Settings2 className="w-8 h-8" /> System Preferences
        </h1>
        <p className="text-muted-foreground">Manage your account, appearance, and data.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
             <nav className="grid gap-1">
                 <Button variant={activeTab === 'general' ? 'secondary' : 'ghost'} className="justify-start gap-2" onClick={() => setActiveTab('general')}>
                     <User className="w-4 h-4" /> General
                 </Button>
                 <Button variant={activeTab === 'appearance' ? 'secondary' : 'ghost'} className="justify-start gap-2" onClick={() => setActiveTab('appearance')}>
                     <Palette className="w-4 h-4" /> Appearance
                 </Button>
                 <Button variant={activeTab === 'preferences' ? 'secondary' : 'ghost'} className="justify-start gap-2" onClick={() => setActiveTab('preferences')}>
                     <Globe className="w-4 h-4" /> Regional & System
                 </Button>
                 <Button variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} className="justify-start gap-2" onClick={() => setActiveTab('notifications')}>
                     <Bell className="w-4 h-4" /> Notifications
                 </Button>
                 <Button variant={activeTab === 'data' ? 'secondary' : 'ghost'} className="justify-start gap-2" onClick={() => setActiveTab('data')}>
                     <Database className="w-4 h-4" /> Data Management
                 </Button>
             </nav>
             
             <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                 <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                     <LogOut className="w-4 h-4" /> Log Out
                 </Button>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pr-2 pb-10">
              
              {/* GENERAL TAB */}
              {activeTab === 'general' && (
                  <div className="space-y-6">
                      <Card>
                          <CardHeader>
                              <CardTitle>Profile Information</CardTitle>
                              <CardDescription>Update your personal details.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="flex items-center gap-4 mb-4">
                                  <Avatar className="h-20 w-20 border-2 border-zinc-200 dark:border-zinc-800">
                                      <AvatarImage src="" />
                                      <AvatarFallback className="text-2xl">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <Button variant="outline" size="sm">Change Avatar</Button>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                      <Label>Full Name</Label>
                                      <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label>Email Address</Label>
                                      <Input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                                  </div>
                              </div>
                          </CardContent>
                          <CardFooter className="justify-between border-t border-zinc-100 dark:border-zinc-800 px-6 py-4">
                              <span className="text-xs text-muted-foreground">User ID: {user?._id}</span>
                              <Button onClick={handleProfileUpdate} disabled={!isProfileChanged}>Save Changes</Button>
                          </CardFooter>
                      </Card>

                      <Card>
                          <CardHeader>
                              <CardTitle>Security</CardTitle>
                              <CardDescription>Manage your password and authentication methods.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                  <div className="space-y-1">
                                      <p className="font-medium">Password</p>
                                      <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                                  </div>
                                  <Button variant="outline">Change Password</Button>
                              </div>
                              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 cursor-not-allowed">
                                  <div className="space-y-1">
                                      <p className="font-medium">Two-Factor Authentication</p>
                                      <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                                  </div>
                                  <Switch disabled />
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                  <div className="space-y-6">
                      <Card>
                          <CardHeader>
                              <CardTitle>Theme Preferences</CardTitle>
                              <CardDescription>Select your preferred interface theme.</CardDescription>
                          </CardHeader>
                          <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div 
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${theme === 'light' ? 'border-primary bg-zinc-50' : 'border-transparent'}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun className="h-8 w-8" />
                                        <span className="font-medium">Light</span>
                                    </div>
                                    <div 
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${theme === 'dark' ? 'border-primary bg-zinc-900' : 'border-transparent'}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon className="h-8 w-8" />
                                        <span className="font-medium">Dark</span>
                                    </div>
                                    <div 
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${theme === 'system' ? 'border-primary bg-zinc-100 dark:bg-zinc-900' : 'border-transparent'}`}
                                        onClick={() => setTheme('system')}
                                    >
                                        <Laptop className="h-8 w-8" />
                                        <span className="font-medium">System</span>
                                    </div>
                                </div>
                          </CardContent>
                      </Card>
                  </div>
              )}

                {/* PREFERENCES TAB */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                      <Card>
                          <CardHeader>
                              <CardTitle>Regional Settings</CardTitle>
                              <CardDescription>Configure currency and formats.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="space-y-2 max-w-sm">
                                  <Label>Currency</Label>
                                  <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select currency" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="USD">USD ($) - United States Dollar</SelectItem>
                                          <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                                          <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                          <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                                          <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                                      </SelectContent>
                                  </Select>
                               </div>
                               <div className="space-y-2 max-w-sm">
                                  <Label>First Day of Week</Label>
                                  <Select value={weekStart} onValueChange={(val) => setWeekStart(val as 'sunday' | 'monday')}>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="sunday">Sunday</SelectItem>
                                          <SelectItem value="monday">Monday</SelectItem>
                                      </SelectContent>
                                  </Select>
                               </div>
                          </CardContent>
                      </Card>
                  </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                  <div className="space-y-6">
                      <Card>
                          <CardHeader>
                              <CardTitle>Notification Settings</CardTitle>
                              <CardDescription>Choose what you want to be notified about.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                      <Label className="text-base">System Notifications</Label>
                                      <p className="text-sm text-muted-foreground">Receive alerts about system updates and maintenance.</p>
                                  </div>
                                  <Switch checked={notifications} onCheckedChange={toggleNotifications} />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                      <Label className="text-base">Sound Effects</Label>
                                      <p className="text-sm text-muted-foreground">Play sounds when completing tasks or interactions.</p>
                                  </div>
                                  <Switch checked={sound} onCheckedChange={toggleSound} />
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              )}

              {/* DATA TAB */}
              {activeTab === 'data' && (
                  <div className="space-y-6">
                      <Card>
                          <CardHeader>
                              <CardTitle>Data Export</CardTitle>
                              <CardDescription>Download a copy of all your data in JSON format.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg flex items-center gap-4">
                                  <div className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                                      <Download className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-medium">Your Personal Archive</p>
                                      <p className="text-sm text-muted-foreground">Includes tasks, finance, fitness, and content data.</p>
                                  </div>
                                  <Button onClick={handleExportData} disabled={exporting}>
                                      {exporting ? "Exporting..." : "Download Data"}
                                  </Button>
                              </div>
                          </CardContent>
                      </Card>

                      <Card className="border-destructive/50">
                          <CardHeader>
                              <CardTitle className="text-destructive flex items-center gap-2">
                                  <Shield className="w-5 h-5" /> Danger Zone
                              </CardTitle>
                              <CardDescription>Irreversible actions.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                  <div className="space-y-1">
                                      <p className="font-medium text-destructive">Delete Account</p>
                                      <p className="text-sm text-destructive/80">Permanently remove your account and all associated data.</p>
                                  </div>
                                  <Button variant="destructive" disabled>Delete Account</Button>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              )}

          </div>
      </div>
    </div>
  );
}

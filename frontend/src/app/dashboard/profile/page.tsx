'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // Suggest adding Badge component if not present, but I'll use div for now to be safe or standard badge
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Globe, Award, Zap, Brain, Shield, Heart, Edit2, Save } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'; // Fallback

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local state for form
  const [formData, setFormData] = useState({
      bio: '',
      tagline: '',
      location: '',
      website: '',
      goals: '', // joined by comma
      skills: '', // joined by comma
      intelligence: 10,
      discipline: 10,
      creativity: 10,
      vitality: 10
  });

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEditOpen = () => {
      setFormData({
          bio: user.bio || '',
          tagline: user.tagline || '',
          location: user.location || '',
          website: user.website || '',
          goals: user.goals?.join(', ') || '',
          skills: user.skills?.join(', ') || '',
          intelligence: user.attributes?.intelligence || 10,
          discipline: user.attributes?.discipline || 10,
          creativity: user.attributes?.creativity || 10,
          vitality: user.attributes?.vitality || 10
      });
      setIsEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const payload = {
              bio: formData.bio,
              tagline: formData.tagline,
              location: formData.location,
              website: formData.website,
              goals: formData.goals.split(',').map(s => s.trim()).filter(Boolean),
              skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
              attributes: {
                  intelligence: Number(formData.intelligence),
                  discipline: Number(formData.discipline),
                  creativity: Number(formData.creativity),
                  vitality: Number(formData.vitality)
              }
          };

          const config = {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          };

          const { data } = await axios.put(`${API_URL}/users/profile`, payload, config);
          updateUser(data);
          toast.success('Profile upgraded successfully');
          setIsEditOpen(false);
      } catch (error) {
          toast.error('Failed to update profile');
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const StatBar = ({ label, value, icon: Icon, color }: any) => (
      <div className="space-y-1">
          <div className="flex justify-between text-sm font-medium">
              <span className="flex items-center gap-2 text-muted-foreground"><Icon className={`w-4 h-4 ${color}`} /> {label}</span>
              <span>{value}/100</span>
          </div>
          <Progress value={value} className="h-2" />
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER CARD */}
      <Card className="border-zinc-800 bg-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-purple-500/20" />
          <CardContent className="pt-16 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pb-6">
              <Avatar className="h-32 w-32 border-4 border-zinc-900 shadow-xl">
                    <AvatarImage src="" /> 
                    <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-200 font-bold">
                        {getInitials(user.name)}
                    </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left space-y-2">
                  <div>
                      <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                      <p className="text-lg text-primary font-medium">{user.tagline || "Player 1"}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-muted-foreground text-sm">
                        {user.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {user.location}</span>}
                        {user.website && <span className="flex items-center gap-1"><Globe className="w-4 h-4"/> {user.website}</span>}
                        <span className="flex items-center gap-1"><Award className="w-4 h-4"/> Level {user.level || 1}</span>
                  </div>
              </div>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleEditOpen}><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                          <DialogTitle>Edit Character Profile</DialogTitle>
                          <DialogDescription>Update your stats and bio.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSave} className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label>Tagline / Class</Label>
                                  <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} placeholder="e.g. Digital Nomad" />
                              </div>
                              <div className="space-y-2">
                                  <Label>Location</Label>
                                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Metropolis" />
                              </div>
                              <div className="space-y-2 col-span-2">
                                  <Label>Website</Label>
                                  <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
                              </div>
                              <div className="space-y-2 col-span-2">
                                  <Label>Bio</Label>
                                  <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Character backstory..." />
                              </div>
                              
                              <div className="col-span-2 space-y-2 pt-2">
                                  <Label className="text-primary font-bold">Base Attributes (0-100)</Label>
                                  <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/50">
                                      <div>
                                          <Label className="text-xs">Intelligence</Label>
                                          <Input type="number" max={100} value={formData.intelligence} onChange={e => setFormData({...formData, intelligence: Number(e.target.value)})} />
                                      </div>
                                      <div>
                                          <Label className="text-xs">Discipline</Label>
                                          <Input type="number" max={100} value={formData.discipline} onChange={e => setFormData({...formData, discipline: Number(e.target.value)})} />
                                      </div>
                                      <div>
                                          <Label className="text-xs">Creativity</Label>
                                          <Input type="number" max={100} value={formData.creativity} onChange={e => setFormData({...formData, creativity: Number(e.target.value)})} />
                                      </div>
                                      <div>
                                          <Label className="text-xs">Vitality</Label>
                                          <Input type="number" max={100} value={formData.vitality} onChange={e => setFormData({...formData, vitality: Number(e.target.value)})} />
                                      </div>
                                  </div>
                              </div>

                              <div className="col-span-2 space-y-2">
                                  <Label>Skills (Comma separated)</Label>
                                  <Input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="React, Designing, Running" />
                              </div>
                              <div className="col-span-2 space-y-2">
                                  <Label>Current Goals (Comma separated)</Label>
                                  <Input value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} placeholder="Launch MVP, Run 5k" />
                              </div>
                          </div>
                          <DialogFooter>
                              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                          </DialogFooter>
                      </form>
                  </DialogContent>
              </Dialog>
          </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
          
          {/* LEFT COLUMN: STATS */}
          <Card className="md:col-span-1 h-fit">
              <CardHeader>
                  <CardTitle className="text-lg">Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <StatBar label="Intelligence" value={user.attributes?.intelligence || 10} icon={Brain} color="text-blue-500" />
                  <StatBar label="Discipline" value={user.attributes?.discipline || 10} icon={Shield} color="text-yellow-500" />
                  <StatBar label="Creativity" value={user.attributes?.creativity || 10} icon={Zap} color="text-purple-500" />
                  <StatBar label="Vitality" value={user.attributes?.vitality || 10} icon={Heart} color="text-red-500" />
              </CardContent>
          </Card>

          {/* CENTRE/RIGHT COLUMN: BIO & DETAILS */}
          <div className="md:col-span-2 space-y-6">
              
              {/* BIO */}
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg">Character Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {user.bio || "No biography data available. Initialize identity."}
                      </p>
                  </CardContent>
              </Card>

              {/* SKILLS & GOALS */}
              <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-lg">Active Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="flex flex-wrap gap-2">
                              {user.skills && user.skills.length > 0 ? (
                                  user.skills.map((skill, i) => (
                                    <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                        {skill}
                                    </span>
                                  ))
                              ) : (
                                  <p className="text-sm text-muted-foreground">No skills learned yet.</p>
                              )}
                          </div>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle className="text-lg">Current Quests (Goals)</CardTitle>
                      </CardHeader>
                      <CardContent>
                           <ul className="space-y-2">
                              {user.goals && user.goals.length > 0 ? (
                                  user.goals.map((goal, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {goal}
                                    </li>
                                  ))
                              ) : (
                                  <p className="text-sm text-muted-foreground">No active quests.</p>
                              )}
                           </ul>
                      </CardContent>
                  </Card>
              </div>

          </div>
      </div>
    </div>
  );
}

'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; 
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    MapPin, Globe, Award, Zap, Brain, Shield, Heart, Edit2, Save, 
    Briefcase, GraduationCap, Languages, Fingerprint, Calendar, Mail, 
    Github, Linkedin, Twitter, ExternalLink, User 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

// --- DUMMY DATA ---
const DUMMY_PROFILE = {
    bio: "Passionate Full Stack Developer with a knack for building scalable web applications. Obsessed with clean code, modern UI/UX, and optimizing performance. Currently exploring the frontiers of AI-driven development.",
    tagline: "Software Architect & Creative Technologist",
    location: "San Francisco, CA",
    website: "https://sahil.dev",
    email: "contact@sahil.dev",
    birthday: "1998-08-15",
    languages: ["English (Native)", "Spanish (Intermediate)", "Japanese (Beginner)"],
    hobbies: ["Photography", "Hiking", "Synthesizers", "Chess"],
    socials: {
        github: "github.com/sahilsahu",
        linkedin: "linkedin.com/in/sahilsahu",
        twitter: "@sahilsahu"
    },
    experience: [
        { role: "Senior Frontend Engineer", company: "TechNova Inc.", duration: "2023 - Present", desc: "Leading the frontend team, migrating legacy apps to Next.js 14." },
        { role: "Software Developer", company: "Creative Solutions", duration: "2021 - 2023", desc: "Built interactive marketing platforms for Fortune 500 clients." }
    ],
    education: [
        { degree: "B.S. Computer Science", school: "Stanford University", year: "2021" }
    ],
    attributes: {
        intelligence: 85,
        discipline: 72,
        creativity: 94,
        vitality: 68,
        charisma: 75,
        luck: 40
    },
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Figma", "UI/UX Design", "GraphQL"],
    goals: ["Launch SaaS Product", "Run a Marathon", "Learn Rust", "Read 50 Books"]
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Merge real user data with dummy data for display if real data is missing
  const displayData = useMemo(() => {
      if (!user) return DUMMY_PROFILE;
      return {
          ...DUMMY_PROFILE, // Base dummy
          ...user, // Overwrite with real
          attributes: { ...DUMMY_PROFILE.attributes, ...(user.attributes || {}) }, // Merge attributes
          // Keep dummy arrays if user's are empty for demo purposes
          skills: (user.skills && user.skills.length > 0) ? user.skills : DUMMY_PROFILE.skills,
          goals: (user.goals && user.goals.length > 0) ? user.goals : DUMMY_PROFILE.goals
      };
  }, [user]);

  // Local state for form editing
  const [formData, setFormData] = useState(displayData);

  const radarData = useMemo(() => [
      { subject: 'INT', A: displayData.attributes.intelligence || 0, fullMark: 100 },
      { subject: 'DIS', A: displayData.attributes.discipline || 0, fullMark: 100 },
      { subject: 'CRE', A: displayData.attributes.creativity || 0, fullMark: 100 },
      { subject: 'VIT', A: displayData.attributes.vitality || 0, fullMark: 100 },
      { subject: 'CHA', A: displayData.attributes.charisma || 0, fullMark: 100 },
      { subject: 'LUCK', A: displayData.attributes.luck || 0, fullMark: 100 },
  ], [displayData]);

  const getInitials = (name: string) => {
    return (name || 'User Name')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEditOpen = () => {
      setFormData(displayData);
      setIsEditOpen(true);
  };

  const handleSave = async () => {
      setLoading(true);
      // Simulate API call since we are using dummy data mostly
      setTimeout(() => {
        updateUser(formData); // Update local store
        toast.success("Identity updated successfully");
        setIsEditOpen(false);
        setLoading(false);
      }, 800);
  };

  // --- Components ---
  const AttributeRow = ({ label, value, icon: Icon, color }: any) => (
      <div className="group flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
          <div className={`p-2 rounded-md bg-secondary/50 ${color} bg-opacity-10`}>
              <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex-1 space-y-1">
              <div className="flex justify-between text-sm font-medium">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{value}/100</span>
              </div>
              <Progress value={value} className="h-2" />
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER HERO */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 shadow-2xl">
          {/* Cover Image/Pattern */}
          <div className="h-48 w-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
              <div className="w-full h-full bg-black/60 backdrop-blur-[2px]" />
          </div>
          
          <div className="px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row gap-6 items-start -mt-16">
                  {/* Avatar */}
                  <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-black shadow-2xl rounded-2xl">
                            <AvatarImage src={'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'} /> 
                            <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-200 font-bold rounded-2xl">
                                {getInitials(user?.name || '')}
                            </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-2 right-2 p-1.5 bg-primary rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <Edit2 className="w-4 h-4" />
                      </button>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 pt-16 md:pt-0 mt-2 space-y-2">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                               <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{user?.name || "User Name"}</h1>
                               <p className="text-lg text-zinc-400 font-medium">{displayData.tagline}</p>
                           </div>
                           <Button onClick={handleEditOpen} variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                               <Edit2 className="w-4 h-4" /> Edit Profile
                           </Button>
                       </div>
                       
                       <div className="flex flex-wrap gap-4 text-sm text-zinc-500 pt-2">
                            {displayData.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary"/> {displayData.location}</span>}
                            {displayData.website && <a href={displayData.website} target="_blank" className="flex items-center gap-1.5 hover:text-primary transition-colors"><Globe className="w-4 h-4 text-primary"/> {displayData.website.replace(/^https?:\/\//, '')}</a>}
                            {displayData.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary"/> {displayData.email}</span>}
                            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-yellow-500"/> Lvl {user?.level || 1} Architect</span>
                       </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Vitals & Stats */}
          <div className="lg:col-span-4 space-y-6">
               
               {/* RADAR CHART */}
               <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md overflow-hidden">
                   <CardContent className="p-2">
                       <div className="h-[280px] w-full relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                   <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Stats" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                                   <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                               </RadarChart>
                           </ResponsiveContainer>
                           <div className="absolute top-2 right-4 text-xs font-mono text-zinc-500">HEX CHART</div>
                       </div>
                   </CardContent>
               </Card>

               <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                   <CardHeader>
                       <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Fingerprint className="w-4 h-4" /> Attributes
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-3">
                       <AttributeRow label="Intelligence" value={displayData.attributes.intelligence} icon={Brain} color="text-blue-500" />
                       <AttributeRow label="Discipline" value={displayData.attributes.discipline} icon={Shield} color="text-yellow-500" />
                       <AttributeRow label="Creativity" value={displayData.attributes.creativity} icon={Zap} color="text-purple-500" />
                       <AttributeRow label="Vitality" value={displayData.attributes.vitality} icon={Heart} color="text-red-500" />
                       <AttributeRow label="Charisma" value={displayData.attributes.charisma} icon={User} color="text-pink-500" />
                   </CardContent>
               </Card>

               <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                   <CardHeader>
                       <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Languages className="w-4 h-4" /> Languages
                       </CardTitle>
                   </CardHeader>
                   <CardContent className="flex flex-wrap gap-2">
                       {displayData.languages?.map((lang: string, i: number) => (
                           <Badge key={i} variant="outline" className="py-1 px-3 border-zinc-700 bg-zinc-800/50">{lang}</Badge>
                       ))}
                   </CardContent>
               </Card>
          </div>

          {/* MAIN COLUMN */}
          <div className="lg:col-span-8">
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start h-12 bg-zinc-900/50 p-1 border border-zinc-800 mb-6">
                      <TabsTrigger value="overview" className="h-full px-6">Overview</TabsTrigger>
                      <TabsTrigger value="professional" className="h-full px-6">Professional</TabsTrigger>
                      <TabsTrigger value="personal" className="h-full px-6">Personal</TabsTrigger>
                      <TabsTrigger value="settings" className="h-full px-6">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                      {/* BIO */}
                      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                          <CardHeader><CardTitle>About</CardTitle></CardHeader>
                          <CardContent>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                                  {displayData.bio}
                              </p>
                          </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SKILLS */}
                            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                                <CardHeader><CardTitle>Tech Stack & Skills</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {displayData.skills.map((skill: string, i: number) => (
                                            <div key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/50 border border-zinc-700 hover:border-primary/50 transition-colors">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* GOALS */}
                            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                                <CardHeader><CardTitle>Active Quests</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {displayData.goals.map((goal: string, i: number) => (
                                            <li key={i} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                                <span className="font-medium">{goal}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                      </div>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-6">
                        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
                            <CardContent className="space-y-8">
                                {displayData.experience.map((exp: any, i: number) => (
                                    <div key={i} className="relative pl-6 border-l-2 border-zinc-800 pb-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-900 border-2 border-primary" />
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold">{exp.role}</h3>
                                            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">{exp.duration}</span>
                                        </div>
                                        <p className="text-primary font-medium mb-2">{exp.company}</p>
                                        <p className="text-muted-foreground text-sm">{exp.desc}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {displayData.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-black/20">
                                        <div className="p-3 bg-zinc-800 rounded-lg">
                                            <GraduationCap className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{edu.school}</h3>
                                            <p className="text-sm text-muted-foreground">{edu.degree}, {edu.year}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                  </TabsContent>
                  
                  <TabsContent value="personal" className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                           <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                                <CardHeader><CardTitle>Social Uplinks</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:bg-white/5 transition-colors cursor-pointer">
                                        <Github className="w-5 h-5" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium text-sm">GitHub</p>
                                            <p className="text-xs text-muted-foreground truncate">{displayData.socials.github}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:bg-white/5 transition-colors cursor-pointer">
                                        <Linkedin className="w-5 h-5 text-blue-500" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium text-sm">LinkedIn</p>
                                            <p className="text-xs text-muted-foreground truncate">{displayData.socials.linkedin}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:bg-white/5 transition-colors cursor-pointer">
                                        <Twitter className="w-5 h-5 text-sky-500" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium text-sm">Twitter</p>
                                            <p className="text-xs text-muted-foreground truncate">{displayData.socials.twitter}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                           </Card>

                           <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                                <CardHeader><CardTitle>Interests & Hobbies</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {displayData.hobbies.map((hobby: string, i: number) => (
                                            <Badge key={i} className="py-2 px-4 bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-primary hover:to-purple-600 transition-all cursor-default">
                                                {hobby}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                           </Card>
                      </div>
                  </TabsContent>

              </Tabs>
          </div>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Edit Profile Identity</DialogTitle>
                  <DialogDescription>Update the core data stored in your user vault.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                      {/* <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </div> */}
                      <div className="space-y-2">
                          <Label>Tagline</Label>
                          <Input value={formData.tagline || ''} onChange={(e) => setFormData({...formData, tagline: e.target.value})} />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label>Bio / About</Label>
                      <Textarea value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={4} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Location</Label>
                          <Input value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Website</Label>
                          <Input value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label>Skills (Comma separated)</Label>
                      <Input value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim())})} />
                  </div>

                  <div className="pt-4 border-t">
                      <Label className="mb-4 block text-lg font-semibold">Attributes Override (0-100)</Label>
                      <div className="grid grid-cols-3 gap-4">
                          {Object.keys(displayData.attributes).map((key) => (
                              <div key={key} className="space-y-1">
                                  <Label className="capitalize text-xs text-muted-foreground">{key}</Label>
                                  <Input 
                                    type="number" 
                                    value={formData.attributes?.[key as keyof typeof formData.attributes] || 0} 
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        attributes: { ...formData.attributes, [key]: parseInt(e.target.value) }
                                    })} 
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

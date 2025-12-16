'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Laptop, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { currency, setCurrency } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your OS experience.</p>
      </div>

      <div className="grid gap-6">
        
        {/* APPEARANCE */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Select your preferred theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 max-w-sm">
                <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    className="flex flex-col h-24 gap-2" 
                    onClick={() => setTheme('light')}
                >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                </Button>
                <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    className="flex flex-col h-24 gap-2" 
                    onClick={() => setTheme('dark')}
                >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                </Button>
                <Button 
                    variant={theme === 'system' ? 'default' : 'outline'} 
                    className="flex flex-col h-24 gap-2" 
                    onClick={() => setTheme('system')}
                >
                    <Laptop className="h-6 w-6" />
                    <span>System</span>
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* PREFERENCES */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage regional and operational settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2 max-w-sm">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
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
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

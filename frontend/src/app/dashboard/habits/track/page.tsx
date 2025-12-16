'use client';

import { HabitTracker } from '@/components/HabitTracker';
import { HabitNav } from '@/components/HabitNav';

export default function TrackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track Progress</h1>
        <p className="text-muted-foreground">Monitor your consistency over time.</p>
      </div>
      
      <HabitNav />

      <HabitTracker />
    </div>
  );
}

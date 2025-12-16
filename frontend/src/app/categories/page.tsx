'use client';

import { useEffect } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CategoriesPage() {
  const { categories, fetchCategories, isLoading } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-indigo-500 to-purple-500', 
    'from-slate-700 to-slate-900', // CS core?
    'from-green-400 to-emerald-600',
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Explore Categories
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover your next path to mastery.
            </p>
          </div>
          <Link href="/">
             <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-48 rounded-xl bg-muted"></div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
                const gradient = gradients[index % gradients.length];
                return (
                <div 
                    key={category._id} 
                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${gradient} transition-opacity duration-300`}></div>
                    <div className={`h-2 w-full bg-gradient-to-r ${gradient}`}></div>
                    
                    <div className="p-6">
                        <div className="mb-4">
                            {/* Icon placeholder - could map icons based on name later */}
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                {category.name[0].toUpperCase()}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors capitalize">
                            {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                             Dive into {category.name}. Track your progress, maintain streaks, and master this domain.
                        </p>
                    </div>
                    
                    <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">0 Active Tasks</span>
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
        )}
      </div>
    </div>
  );
}

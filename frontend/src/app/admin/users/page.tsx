'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { users, fetchUsers, updateUserRole, deleteUser, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, router, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted');
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {isLoading ? 'Loading...' : 'No users found'}
                </div>
            ) : (
                <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
                        <div className="col-span-4">Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-1">Actions</div>
                    </div>
                    {users.map((u) => (
                        <div key={u._id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/10 transition-colors">
                            <div className="col-span-4 font-medium">{u.name}</div>
                            <div className="col-span-4 text-muted-foreground truncate">{u.email}</div>
                            <div className="col-span-3">
                                {u._id === user?._id ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                        {u.role} (You)
                                    </span>
                                ) : (
                                    <Select 
                                        defaultValue={u.role} 
                                        onValueChange={(val) => handleRoleChange(u._id, val)}
                                    >
                                        <SelectTrigger className="w-[130px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="col-span-1">
                                {u._id !== user?._id && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(u._id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

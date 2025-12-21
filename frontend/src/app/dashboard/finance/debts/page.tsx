'use client';

import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore, formatCurrencyValue } from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinanceNav } from '@/components/FinanceNav';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function FinanceDebtsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useSettingsStore();
  const { 
      debts, fetchDebts, addDebt, toggleDebt, deleteDebt
  } = useFinanceStore();
  const router = useRouter();

  const [isDebtOpen, setIsDebtOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ type: 'payable' as 'payable'|'receivable', person: '', amount: '', dueDate: '', notes: '' });

  useEffect(() => {
    if (useAuthStore.getState().isHydrated && !isAuthenticated) {
        router.push('/login');
    } else if (isAuthenticated) {
        fetchDebts();
    }
  }, [isAuthenticated, fetchDebts]);

  const handleDebtSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addDebt({ ...debtForm, amount: Number(debtForm.amount), dueDate: debtForm.dueDate || undefined });
      setIsDebtOpen(false);
      setDebtForm({ ...debtForm, amount: '', person: '', notes: '' });
  };

  const formatMoney = (amount: number) => formatCurrencyValue(amount, currency);
  
  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <FinanceNav />
        
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Debts & Loans</h1>
                <p className="text-muted-foreground">Manage your interpersonal finances.</p>
            </div>
            <Dialog open={isDebtOpen} onOpenChange={setIsDebtOpen}>
                <DialogTrigger asChild>
                     <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                        <Plus className="w-4 h-4 mr-2"/> Record Debt
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Record Debt/Loan</DialogTitle></DialogHeader>
                    <form onSubmit={handleDebtSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant={debtForm.type === 'payable' ? 'destructive' : 'outline'} onClick={() => setDebtForm({...debtForm, type: 'payable'})} className={cn(debtForm.type === 'payable' && "ring-2 ring-offset-2 ring-red-500")}>I Owe (Payable)</Button>
                            <Button type="button" variant={debtForm.type === 'receivable' ? 'default' : 'outline'} className={cn(debtForm.type === 'receivable' ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-600' : '')} onClick={() => setDebtForm({...debtForm, type: 'receivable'})}>They Owe Me (Receivable)</Button>
                        </div>
                        <div className="space-y-2"><Label>Person/Entity</Label><Input required value={debtForm.person} onChange={(e) => setDebtForm({...debtForm, person: e.target.value})} placeholder="Name..." /></div>
                        <div className="space-y-2"><Label>Amount</Label><Input type="number" required value={debtForm.amount} onChange={(e) => setDebtForm({...debtForm, amount: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Due Date (Optional)</Label><Input type="date" value={debtForm.dueDate} onChange={(e) => setDebtForm({...debtForm, dueDate: e.target.value})} /></div>
                        <Button type="submit" className="w-full">Save Record</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500"><ArrowUpRight className="w-5 h-5"/> Receivable (They Owe You)</h2>
                {receivables.length === 0 && <p className="text-muted-foreground italic">No active receivables.</p>}
                {receivables.map(debt => (
                    <Card key={debt._id} className={cn("border-l-4 border-l-blue-500 hover:shadow-md transition-all", debt.isSettled && "opacity-50 grayscale")}>
                         <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-lg">{debt.person}</div>
                                <div className="text-2xl font-black text-blue-500">{formatMoney(debt.amount)}</div>
                                {debt.dueDate && <div className="text-xs text-amber-500 font-bold mt-1">Due: {format(parseISO(debt.dueDate), 'MMM dd')}</div>}
                            </div>
                            <div className="flex flex-col gap-2">
                                {!debt.isSettled ? (
                                    <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => toggleDebt(debt._id)}>Mark Paid</Button>
                                ) : (
                                    <div className="flex items-center text-green-500 text-xs font-bold gap-1"><CheckCircle2 className="w-4 h-4"/> SETTLED</div>
                                )}
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 self-end" onClick={() => deleteDebt(debt._id)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                         </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-red-500"><ArrowDownLeft className="w-5 h-5"/> Payable (You Owe)</h2>
                {payables.length === 0 && <p className="text-muted-foreground italic">No active debts.</p>}
                {payables.map(debt => (
                    <Card key={debt._id} className={cn("border-l-4 border-l-red-500 hover:shadow-md transition-all", debt.isSettled && "opacity-50 grayscale")}>
                         <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-lg">{debt.person}</div>
                                <div className="text-2xl font-black text-red-500">{formatMoney(debt.amount)}</div>
                                {debt.dueDate && <div className="text-xs text-amber-500 font-bold mt-1">Due: {format(parseISO(debt.dueDate), 'MMM dd')}</div>}
                            </div>
                            <div className="flex flex-col gap-2">
                                {!debt.isSettled ? (
                                    <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => toggleDebt(debt._id)}>Mark Paid</Button>
                                ) : (
                                    <div className="flex items-center text-green-500 text-xs font-bold gap-1"><CheckCircle2 className="w-4 h-4"/> SETTLED</div>
                                )}
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 self-end" onClick={() => deleteDebt(debt._id)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                         </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}

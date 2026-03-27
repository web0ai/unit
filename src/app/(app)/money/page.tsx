"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Section = "overview" | "budget" | "goals" | "debt";

interface IncomeExpense {
  id: string;
  title: string;
  amount: string;
  type: string;
  category: string | null;
  is_recurring: boolean;
  date: string;
}

interface FinancialGoal {
  id: string;
  title: string;
  target_amount: string;
  current_amount: string;
  deadline: string | null;
}

interface Debt {
  id: string;
  title: string;
  principal: string;
  interest_rate: string | null;
  minimum_payment: string | null;
  balance: string;
}

export default function MoneyPage() {
  const [section, setSection] = useState<Section>("overview");
  const [items, setItems] = useState<IncomeExpense[]>([]);
  const [fGoals, setFGoals] = useState<FinancialGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", amount: "", type: "expense", category: "", date: new Date().toISOString().split("T")[0] });
  const [newGoal, setNewGoal] = useState({ title: "", target_amount: "", current_amount: "0" });
  const [newDebt, setNewDebt] = useState({ title: "", principal: "", balance: "", interest_rate: "", minimum_payment: "" });

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [i, g, d] = await Promise.all([
        supabase.from("income_expenses").select("*").order("date", { ascending: false }),
        supabase.from("financial_goals").select("*").order("created_at"),
        supabase.from("debts").select("*").order("created_at"),
      ]);
      if (i.data) setItems(i.data);
      if (g.data) setFGoals(g.data);
      if (d.data) setDebts(d.data);
    }
    load();
  }, [supabase]);

  const totalIncome = items.filter((i) => i.type === "income").reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = items.filter((i) => i.type === "expense").reduce((s, i) => s + Number(i.amount), 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
  const totalDebt = debts.reduce((s, d) => s + Number(d.balance), 0);

  async function addItem() {
    if (!newItem.title || !newItem.amount) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("income_expenses").insert({
      unit_id: unit.id, ...newItem, amount: newItem.amount,
    }).select().single();
    if (data) { setItems([data, ...items]); setNewItem({ title: "", amount: "", type: "expense", category: "", date: new Date().toISOString().split("T")[0] }); setShowAddItem(false); }
  }

  async function addFinancialGoal() {
    if (!newGoal.title || !newGoal.target_amount) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("financial_goals").insert({
      unit_id: unit.id, ...newGoal,
    }).select().single();
    if (data) { setFGoals([...fGoals, data]); setNewGoal({ title: "", target_amount: "", current_amount: "0" }); setShowAddGoal(false); }
  }

  async function addDebtItem() {
    if (!newDebt.title || !newDebt.balance) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("debts").insert({
      unit_id: unit.id, title: newDebt.title, principal: newDebt.principal || newDebt.balance,
      balance: newDebt.balance, interest_rate: newDebt.interest_rate || null, minimum_payment: newDebt.minimum_payment || null,
    }).select().single();
    if (data) { setDebts([...debts, data]); setNewDebt({ title: "", principal: "", balance: "", interest_rate: "", minimum_payment: "" }); setShowAddDebt(false); }
  }

  // Donut chart SVG
  function DonutChart() {
    if (totalIncome === 0 && totalExpenses === 0) return null;
    const total = totalIncome + totalExpenses;
    const incPct = (totalIncome / total) * 100;
    const expPct = (totalExpenses / total) * 100;
    const r = 40;
    const c = 2 * Math.PI * r;
    return (
      <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f0f2e4" strokeWidth="12" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#606C38" strokeWidth="12"
          strokeDasharray={`${(incPct / 100) * c} ${c}`} strokeDashoffset={c * 0.25} strokeLinecap="round" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#DDA15E" strokeWidth="12"
          strokeDasharray={`${(expPct / 100) * c} ${c}`} strokeDashoffset={c * 0.25 - (incPct / 100) * c} strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-[26px] font-semibold text-forest">Money</h1>

      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted overflow-x-auto">
        {(["overview", "budget", "goals", "debt"] as Section[]).map((s) => (
          <button key={s} onClick={() => setSection(s)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${
              section === s ? "bg-surface text-forest shadow-sm" : "text-muted-text hover:text-forest"
            }`}>
            {s === "goals" ? "Goals" : s === "debt" ? "Debt" : s}
          </button>
        ))}
      </div>

      {/* Overview */}
      {section === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Monthly Income" value={`$${totalIncome.toLocaleString()}`} color="olive" />
            <StatCard label="Monthly Expenses" value={`$${totalExpenses.toLocaleString()}`} color="amber" />
            <StatCard label="Savings Rate" value={`${savingsRate}%`} color="olive" />
            <StatCard label="Total Debt" value={`$${totalDebt.toLocaleString()}`} color="terra" />
          </div>
          <div className="rounded-[14px] border border-border bg-surface p-5 text-center">
            <DonutChart />
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-olive" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber" /> Expenses
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget */}
      {section === "budget" && (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
              <div>
                <p className="text-sm font-medium text-forest">{item.title}</p>
                <p className="text-[11px] text-muted-text">{item.category || item.type} · {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <span className={`text-sm font-semibold ${item.type === "income" ? "text-olive" : "text-terra"}`}>
                {item.type === "income" ? "+" : "-"}${Number(item.amount).toLocaleString()}
              </span>
            </div>
          ))}

          {showAddItem ? (
            <div className="rounded-[14px] border border-border bg-surface p-4 space-y-3">
              <input placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              <div className="flex gap-2">
                <input placeholder="Amount" type="number" value={newItem.amount} onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
                <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
                <input type="date" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive" />
              </div>
              <div className="flex gap-2">
                <button onClick={addItem} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add</button>
                <button onClick={() => setShowAddItem(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddItem(true)} className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all">
              + Add income or expense
            </button>
          )}
        </div>
      )}

      {/* Financial Goals */}
      {section === "goals" && (
        <div className="space-y-3">
          {fGoals.map((g) => {
            const pct = Number(g.target_amount) > 0 ? Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100) : 0;
            return (
              <div key={g.id} className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-forest">{g.title}</span>
                  <span className="text-[13px] font-medium text-olive">{pct}%</span>
                </div>
                <p className="text-[11px] text-muted-text mb-2">
                  ${Number(g.current_amount).toLocaleString()} / ${Number(g.target_amount).toLocaleString()}
                  {g.deadline && ` · Due ${new Date(g.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                </p>
                <div className="h-2 bg-olive-light rounded-pill overflow-hidden">
                  <div className="h-full bg-olive rounded-pill transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}

          {showAddGoal ? (
            <div className="rounded-[14px] border border-border bg-surface p-4 space-y-3">
              <input placeholder="Goal name" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              <div className="flex gap-2">
                <input placeholder="Target amount" type="number" value={newGoal.target_amount} onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
                <input placeholder="Current amount" type="number" value={newGoal.current_amount} onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              </div>
              <div className="flex gap-2">
                <button onClick={addFinancialGoal} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add</button>
                <button onClick={() => setShowAddGoal(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddGoal(true)} className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all">
              + Add financial goal
            </button>
          )}
        </div>
      )}

      {/* Debt */}
      {section === "debt" && (
        <div className="space-y-3">
          {debts.map((d) => {
            const paidPct = Number(d.principal) > 0 ? Math.round(((Number(d.principal) - Number(d.balance)) / Number(d.principal)) * 100) : 0;
            return (
              <div key={d.id} className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-forest">{d.title}</span>
                  <span className="text-[13px] font-medium text-terra">${Number(d.balance).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-muted-text mb-2">
                  {d.interest_rate && `${d.interest_rate}% APR · `}
                  {d.minimum_payment && `$${Number(d.minimum_payment).toLocaleString()}/mo · `}
                  {paidPct}% paid off
                </p>
                <div className="h-2 bg-amber/20 rounded-pill overflow-hidden">
                  <div className="h-full bg-amber rounded-pill transition-all duration-500" style={{ width: `${Math.min(paidPct, 100)}%` }} />
                </div>
              </div>
            );
          })}

          {showAddDebt ? (
            <div className="rounded-[14px] border border-border bg-surface p-4 space-y-3">
              <input placeholder="Debt name" value={newDebt.title} onChange={(e) => setNewDebt({ ...newDebt, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              <div className="flex gap-2">
                <input placeholder="Original amount" type="number" value={newDebt.principal} onChange={(e) => setNewDebt({ ...newDebt, principal: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
                <input placeholder="Current balance" type="number" value={newDebt.balance} onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              </div>
              <div className="flex gap-2">
                <input placeholder="Interest %" type="number" value={newDebt.interest_rate} onChange={(e) => setNewDebt({ ...newDebt, interest_rate: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
                <input placeholder="Min payment" type="number" value={newDebt.minimum_payment} onChange={(e) => setNewDebt({ ...newDebt, minimum_payment: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              </div>
              <div className="flex gap-2">
                <button onClick={addDebtItem} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add</button>
                <button onClick={() => setShowAddDebt(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddDebt(true)} className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all">
              + Add debt
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClass = color === "olive" ? "text-olive" : color === "amber" ? "text-amber" : "text-terra";
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-text font-semibold">{label}</p>
      <p className={`font-heading text-xl font-semibold mt-1 ${colorClass}`}>{value}</p>
    </div>
  );
}

export type Shift = {
  id: string;
  personnel_name: string;
  start_time: string;
  end_time: string | null;
  starting_cash: number;
  ending_cash: number | null;
  bank_balance: number | null;
  total_commission: number;
  total_expenses: number;
  total_profit_withdrawn: number;
  cash_deficit: number | null;
  status: 'open' | 'closed';
  created_at: string;
};

export type Transaction = {
  id: string;
  shift_id: string;
  type: 'komisyon' | 'masraf' | 'kar';
  amount: number;
  description: string;
  created_at: string;
};

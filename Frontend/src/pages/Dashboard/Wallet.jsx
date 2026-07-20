import { useQuery } from "@tanstack/react-query";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Loader from "../../common/Loader.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import { getWallet } from "../../api/user.api.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

const Wallet = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => (await getWallet()).data.data.wallet,
  });

  if (isLoading) return <Loader label="Loading wallet…" />;

  const transactions = [...(data?.transactions || [])].reverse();

  return (
    <div>
      <div className="card mb-6 flex items-center gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <WalletIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm text-text-muted">Available Balance</p>
          <p className="font-heading text-2xl font-bold text-text">{formatCurrency(data?.balance || 0)}</p>
        </div>
      </div>

      <h3 className="mb-3 font-heading text-base font-semibold text-text">Transaction History</h3>
      {!transactions.length ? (
        <EmptyState title="No transactions yet" description="Wallet credits and redemptions will show up here." />
      ) : (
        <div className="card divide-y divide-border">
          {transactions.map((tx) => (
            <div key={tx._id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tx.type === "credit" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                  {tx.type === "credit" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{tx.reason}</p>
                  <p className="text-xs text-text-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              <p className={`font-semibold ${tx.type === "credit" ? "text-success" : "text-danger"}`}>
                {tx.type === "credit" ? "+" : "-"} {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wallet;

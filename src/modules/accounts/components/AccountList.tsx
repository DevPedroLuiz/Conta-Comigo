import { Account } from '../types/account.types';
import { AccountCard } from './AccountCard';

interface AccountListProps {
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function AccountList({ accounts, onDelete }: AccountListProps) {
  return (
    <div className="space-y-4">
      {accounts.map(account => (
        <AccountCard key={account.id} account={account} onDelete={onDelete} />
      ))}
    </div>
  );
}

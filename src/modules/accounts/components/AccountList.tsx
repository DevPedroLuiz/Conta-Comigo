import { Account } from '../types/account.types';
import { AccountCard } from './AccountCard';
import { StaggerContainer, StaggerItem } from '../../../core/ui/components/StaggerAnimation';

interface AccountListProps {
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function AccountList({ accounts, onDelete }: AccountListProps) {
  return (
    <StaggerContainer className="space-y-4">
      {accounts.map(account => (
        <StaggerItem key={account.id}>
          <AccountCard account={account} onDelete={onDelete} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

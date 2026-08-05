import re

with open('src/modules/open-finance/components/BankSyncModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<Dialog open={open} onOpenChange={onOpenChange}>',
    '<Dialog open={open} onOpenChange={(val) => !isSyncing && onOpenChange(val)}>'
)

content = content.replace(
    '{loadingToken ? (',
    '{loadingToken || isSyncing ? ('
)

content = content.replace(
    '<p className="text-sm">Iniciando conexão segura...</p>',
    '<p className="text-sm">{isSyncing ? "Sincronizando suas contas e transações..." : "Iniciando conexão segura..."}</p>'
)

with open('src/modules/open-finance/components/BankSyncModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

with open('src/modules/open-finance/components/BankSyncModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'useQueryClient' not in content:
    content = content.replace(
        "import { PluggyConnect } from 'react-pluggy-connect';",
        "import { PluggyConnect } from 'react-pluggy-connect';\nimport { useQueryClient } from '@tanstack/react-query';"
    )
    
    content = content.replace(
        "export function BankSyncModal({ open, onOpenChange, onSyncComplete }: BankSyncModalProps) {",
        "export function BankSyncModal({ open, onOpenChange, onSyncComplete }: BankSyncModalProps) {\n  const queryClient = useQueryClient();"
    )
    
    content = content.replace(
        "if (onSyncComplete) {",
        "queryClient.invalidateQueries({ queryKey: ['transactions'] });\n      queryClient.invalidateQueries({ queryKey: ['dashboard'] });\n      if (onSyncComplete) {"
    )

with open('src/modules/open-finance/components/BankSyncModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

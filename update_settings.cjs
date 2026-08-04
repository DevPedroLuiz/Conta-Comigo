const fs = require('fs');
let code = fs.readFileSync('src/modules/settings/pages/SettingsPage.tsx', 'utf8');
const fdw = `
              <div className="space-y-2">
                <Label htmlFor="first_day_of_week">Primeiro Dia da Semana</Label>
                <Select
                  value={String(settingsForm.watch('first_day_of_week'))}
                  onValueChange={(val) => settingsForm.setValue('first_day_of_week', parseInt(val, 10), { shouldDirty: true })}
                >
                  <SelectTrigger id="first_day_of_week">
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Segunda-feira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
`;

code = code.replace(
  '</CardContent>',
  fdw + '\n            </CardContent>'
);

fs.writeFileSync('src/modules/settings/pages/SettingsPage.tsx', code);

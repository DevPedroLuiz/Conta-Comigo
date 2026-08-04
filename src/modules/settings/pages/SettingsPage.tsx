import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '../../auth/hooks/useAuth';
import { settingsService, UserProfileUpdate, UserSettingsUpdate } from '../services/SettingsService';
import { useTheme } from '../../../core/providers/ThemeProvider';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../core/ui/components/card';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Button } from '../../../core/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { Spinner } from '../../../core/ui/components/spinner';

export function SettingsPage() {
  const user = useUser();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  const profileForm = useForm<UserProfileUpdate>({
    defaultValues: { full_name: '', avatar_url: '', timezone: '' }
  });

  const settingsForm = useForm<UserSettingsUpdate>({
    defaultValues: { theme: 'system', language: 'pt-BR', currency: 'BRL', date_format: 'DD/MM/YYYY', first_day_of_week: 0 }
  });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setIsLoading(true);
      const { data, error } = await settingsService.getUserData(user.id);
      if (data) {
        if (data.profile) {
          profileForm.reset({
            full_name: data.profile.full_name || '',
            avatar_url: data.profile.avatar_url || '',
            timezone: data.profile.timezone || ''
          });
        }
        if (data.settings) {
          settingsForm.reset({
            theme: data.settings.theme || 'system',
            language: data.settings.language || 'pt-BR',
            currency: data.settings.currency || 'BRL',
            date_format: data.settings.date_format || 'DD/MM/YYYY',
            first_day_of_week: data.settings.first_day_of_week ?? 0
          });
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [user?.id, profileForm, settingsForm]);

  const onProfileSubmit = async (data: UserProfileUpdate) => {
    if (!user?.id) return;
    const { error } = await settingsService.updateProfile(user.id, data);
    if (!error) {
      toast.success('Perfil atualizado com sucesso!');
    }
  };

  const onSettingsSubmit = async (data: UserSettingsUpdate) => {
    if (!user?.id) return;
    const { error } = await settingsService.updateSettings(user.id, data);
    if (!error) {
      if (data.theme) {
        setTheme(data.theme as 'light' | 'dark' | 'system');
      }
      toast.success('Configurações atualizadas com sucesso!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie seu perfil e preferências do sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" {...profileForm.register('full_name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL do Avatar</Label>
                <Input id="avatar_url" placeholder="https://..." {...profileForm.register('avatar_url')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={profileForm.watch('timezone')}
                  onValueChange={(val) => profileForm.setValue('timezone', val, { shouldDirty: true })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (BRT)</SelectItem>
                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
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

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Salvar Perfil
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Settings Card */}
        <Card>
          <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Personalize sua experiência no aplicativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={settingsForm.watch('theme')}
                  onValueChange={(val) => {
                    settingsForm.setValue('theme', val, { shouldDirty: true });
                    setTheme(val as 'light' | 'dark' | 'system');
                  }}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={settingsForm.watch('language')}
                  onValueChange={(val) => settingsForm.setValue('language', val, { shouldDirty: true })}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda Base</Label>
                <Select
                  value={settingsForm.watch('currency')}
                  onValueChange={(val) => settingsForm.setValue('currency', val, { shouldDirty: true })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar (US$)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_format">Formato de Data</Label>
                <Select
                  value={settingsForm.watch('date_format')}
                  onValueChange={(val) => settingsForm.setValue('date_format', val, { shouldDirty: true })}
                >
                  <SelectTrigger id="date_format">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={settingsForm.formState.isSubmitting}>
                {settingsForm.formState.isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Salvar Preferências
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

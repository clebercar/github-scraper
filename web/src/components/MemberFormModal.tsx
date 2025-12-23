import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Member, MemberFormData } from '@/types/member';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface MemberFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  onSubmit: (data: MemberFormData) => Promise<void>;
}

export function MemberFormModal({ open, onOpenChange, member, onSubmit }: MemberFormModalProps) {
  const [formData, setFormData] = useState<MemberFormData>({ name: '', url: '' });
  const [errors, setErrors] = useState<Partial<MemberFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setFormData({ name: member.name, url: member.url });
    } else {
      setFormData({ name: '', url: '' });
    }
    setErrors({});
  }, [member, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<MemberFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL é obrigatória';
    } else {
      try {
        const url = new URL(formData.url);
        if (!url.hostname.includes('github.com')) {
          newErrors.url = 'URL deve ser do GitHub';
        }
      } catch {
        newErrors.url = 'URL inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: member ? 'Membro atualizado!' : 'Membro criado!',
        description: 'O scraping será iniciado automaticamente.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Algo deu errado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>{member ? 'Editar Membro' : 'Adicionar Novo Membro'}</DialogTitle>
          <DialogDescription>
            {member
              ? 'Atualize as informações do membro. O scraping será reiniciado.'
              : 'Adicione um novo perfil do GitHub para monitorar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do membro"
              className="bg-input border-border"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL do GitHub</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://github.com/username"
              className="bg-input border-border font-mono text-sm"
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {member ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

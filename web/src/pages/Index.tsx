import { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Member, MemberFormData } from "@/types/member";
import { api } from "@/services/api";
import { Header } from "@/components/Header";
import { SearchInput } from "@/components/SearchInput";
import { MemberCard } from "@/components/MemberCard";
import { MemberFormModal } from "@/components/MemberFormModal";
import { EmptyState } from "@/components/EmptyState";
import { LoadingPage, LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();

  const fetchMembers = async (showRefreshLoading = false) => {
    if (showRefreshLoading) setIsRefreshing(true);

    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar membros",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    // Polling for status updates every 10 seconds
    const interval = setInterval(() => {
      const hasProcessing = members.some(
        (m) =>
          m.scraping_status === "pending" || m.scraping_status === "processing"
      );
      if (hasProcessing) {
        fetchMembers();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [members.length]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.username?.toLowerCase().includes(query) ||
        member.location?.toLowerCase().includes(query) ||
        member.organizations.some((org) => org.toLowerCase().includes(query))
      );
    });
  }, [members, searchQuery]);

  const handleCreateOrUpdate = async (data: MemberFormData) => {
    if (editingMember) {
      await api.updateMember(editingMember.id, data);
    } else {
      await api.createMember(data);
    }
    await fetchMembers();
    setEditingMember(null);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Gerenciador de Perfis
          </h2>
          <p className="text-muted-foreground">
            Monitore e gerencie perfis do GitHub com facilidade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por nome, username, organização ou localização..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchMembers(true)}
              disabled={isRefreshing}
              className="shrink-0"
            >
              {isRefreshing ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
            <Button onClick={handleOpenCreate} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo
            </Button>
          </div>
        </div>

        {members.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredMembers.length} de {members.length} membro
            {members.length !== 1 && "s"}
          </p>
        )}

        <div className="space-y-3">
          {members.length === 0 ? (
            <EmptyState type="no-members" />
          ) : filteredMembers.length === 0 ? (
            <EmptyState type="no-results" searchQuery={searchQuery} />
          ) : (
            filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} onEdit={handleEdit} />
            ))
          )}
        </div>
      </main>

      <MemberFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        member={editingMember}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Index;

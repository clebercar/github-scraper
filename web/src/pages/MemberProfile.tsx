import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Pencil,
  Trash2,
  Users,
  GitFork,
  Star,
  Calendar,
  MapPin,
  Building2,
  Link as LinkIcon,
} from "lucide-react";
import { Member, MemberFormData } from "@/types/member";
import { api } from "@/services/api";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { MemberFormModal } from "@/components/MemberFormModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { LoadingPage, LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRescanning, setIsRescanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchMember = async () => {
    try {
      const data = await api.getMember(Number(id));
      setMember(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar membro",
        description:
          error instanceof Error ? error.message : "Membro não encontrado",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();

    // Polling for status updates
    const interval = setInterval(() => {
      if (
        member?.scraping_status === "pending" ||
        member?.scraping_status === "processing"
      ) {
        fetchMember();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, member?.scraping_status]);

  const handleRescan = async () => {
    if (!member) return;
    setIsRescanning(true);
    try {
      await api.rescanMember(member.id, { name: member.name, url: member.url });
      toast({ title: "Re-escaneamento iniciado!" });
      await fetchMember();
    } catch (error) {
      toast({
        title: "Erro ao re-escanear",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsRescanning(false);
    }
  };

  const handleUpdate = async (data: MemberFormData) => {
    if (!member) return;
    await api.updateMember(member.id, data);
    await fetchMember();
  };

  const handleDelete = async () => {
    if (!member) return;
    setIsDeleting(true);
    try {
      await api.deleteMember(member.id);
      toast({ title: "Membro removido com sucesso!" });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading || !member) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingPage />
      </div>
    );
  }

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Link>

        <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-border">
              <AvatarImage
                src={member.avatar_url || undefined}
                alt={member.name}
              />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {member.name}
                </h1>
                <StatusBadge status={member.scraping_status} />
              </div>

              {member.username && (
                <p className="text-lg text-muted-foreground font-mono mb-3">
                  @{member.username}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                <a
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span className="font-mono">{member.url}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <a
                  href={member.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-mono hover:bg-primary/20 transition-colors"
                >
                  URL Curta: {member.short_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {member.location && (
                <p className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  {member.location}
                </p>
              )}

              {member.organizations.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {member.organizations.map((org) => (
                    <Badge key={org} variant="secondary" className="font-mono">
                      {org}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleRescan}
                disabled={
                  isRescanning || member.scraping_status === "processing"
                }
              >
                {isRescanning ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Re-escanear
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Seguidores"
            value={member.followers_count}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Seguindo"
            value={member.following_count}
          />
          <StatCard
            icon={<GitFork className="h-5 w-5" />}
            label="Repositórios"
            value={member.public_repos_count}
          />
          <StatCard
            icon={<Star className="h-5 w-5" />}
            label="Stars"
            value={member.starts_count}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Contribuições (ano)"
            value={member.total_contributions_last_year}
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Metadata */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações do Registro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Criado em:</span>
              <span className="ml-2 text-foreground font-mono">
                {new Date(member.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Atualizado em:</span>
              <span className="ml-2 text-foreground font-mono">
                {new Date(member.updated_at).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      </main>

      <MemberFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={member}
        onSubmit={handleUpdate}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        memberName={member.name}
      />
    </div>
  );
};

export default MemberProfile;

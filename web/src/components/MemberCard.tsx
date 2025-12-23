import { Link } from 'react-router-dom';
import { ExternalLink, Eye, Pencil } from 'lucide-react';
import { Member } from '@/types/member';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group glass-card rounded-lg p-4 hover:border-primary/50 transition-all duration-300 animate-fade-in">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary/50 transition-colors">
          <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
            <StatusBadge status={member.scraping_status} />
          </div>
          
          <a
            href={member.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            {member.short_url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Link to={`/members/${member.id}`}>
              <Eye className="h-4 w-4 mr-1.5" />
              Visualizar
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(member)}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Editar
          </Button>
        </div>
      </div>

      {member.username && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono">@{member.username}</span>
          {member.location && (
            <span className="flex items-center gap-1">
              📍 {member.location}
            </span>
          )}
          {member.organizations.length > 0 && (
            <span className="flex items-center gap-1">
              🏢 {member.organizations.slice(0, 2).join(', ')}
              {member.organizations.length > 2 && ` +${member.organizations.length - 2}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

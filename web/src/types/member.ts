export interface Member {
  id: number;
  name: string;
  url: string;
  username: string | null;
  avatar_url: string | null;
  followers_count: number | null;
  following_count: number | null;
  public_repos_count: number | null;
  starts_count: number | null;
  total_contributions_last_year: number | null;
  organizations: string[];
  location: string | null;
  short_url: string;
  scraping_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface MemberFormData {
  name: string;
  url: string;
}

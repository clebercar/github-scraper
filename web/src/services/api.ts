import { Member, MemberFormData } from '@/types/member';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  async getMembers(): Promise<Member[]> {
    const response = await fetch(`${API_BASE_URL}/members`);
    return handleResponse<Member[]>(response);
  },

  async getMember(id: number): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`);
    return handleResponse<Member>(response);
  },

  async createMember(data: MemberFormData): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: data }),
    });
    return handleResponse<Member>(response);
  },

  async updateMember(id: number, data: MemberFormData): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: data }),
    });
    return handleResponse<Member>(response);
  },

  async deleteMember(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  async rescanMember(id: number, data: MemberFormData): Promise<Member> {
    return this.updateMember(id, data);
  },
};

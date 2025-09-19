import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserType = 'felipe' | 'manuela';

interface User {
  id: string;
  type: UserType;
  name: string;
  username: string;
  avatar_url?: string;
}

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user: authUser } = useAuth();

  // Fetch users from database and set current user based on auth
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedUsers: User[] = data?.map((user, index) => {
        // Determine user type based on username pattern
        const isManuela = user.username.toLowerCase().includes('manuela') || 
                         user.username.toLowerCase().includes('manu') ||
                         user.username.toLowerCase().includes('manulera');
        const isFelipe = user.username.toLowerCase().includes('felipe');
        
        let userType: UserType;
        let name: string;
        
        if (isManuela) {
          userType = 'manuela';
          name = 'Manuela';
        } else if (isFelipe) {
          userType = 'felipe';
          name = 'Felipe';
        } else {
          // Fallback based on order (first user is Felipe, second is Manuela)
          userType = index === 0 ? 'felipe' : 'manuela';
          name = index === 0 ? 'Felipe' : 'Manuela';
        }

        return {
          id: user.id,
          type: userType,
          name,
          username: user.username,
          avatar_url: user.avatar_url
        };
      }) || [];

      setUsers(mappedUsers);

      // Set current user based on authenticated user
      if (authUser) {
        const authenticatedUser = mappedUsers.find(u => u.id === authUser.id);
        if (authenticatedUser) {
          setCurrentUser(authenticatedUser);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchUsers();
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [authUser]);

  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  };

  const getManuelaUser = (): User | undefined => {
    return users.find(u => u.type === 'manuela');
  };

  const getFelipeUser = (): User | undefined => {
    return users.find(u => u.type === 'felipe');
  };

  return {
    currentUser,
    users,
    loading,
    getUserById,
    getManuelaUser,
    getFelipeUser,
    isAuthenticated: !!currentUser,
    refresh: fetchUsers
  };
};
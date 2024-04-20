import { useEffect, useState } from 'react';
import { currentToken, getToken, refreshToken } from '@utils/auth';
import { getUserData } from '@utils/data';
import { IUser } from '@interfaces/users';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser>();
  const code = new URLSearchParams(window.location.search).get("code");

  useEffect(() => {
    const fetchUser = async () => {
      const expiryDate = localStorage.getItem('expires');

      if (expiryDate && new Date(expiryDate) < new Date()) {
        const token = await refreshToken();
        currentToken.save(token);
      }

      const { access_token } = currentToken;
  
      if (code) {
        const token = await getToken(code);

        if (!token) {
          return;
        }

        currentToken.save(token);
        const url = new URL(window.location.href);
        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace("?", "");
        window.location.href = updatedUrl;
      }
  
      if (access_token) {
        const data = await getUserData();
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  return {loading, user};
};

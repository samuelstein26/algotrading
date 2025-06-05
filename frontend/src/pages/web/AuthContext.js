import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../../hooks/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)

    const checkAuth = useCallback(async () => {
        try {
            const response = await api.get('/verify')
            setUser(response.data.user)
        } catch (error) {
            setUser(null)
        }
    }, [])

    const login = useCallback(async (emailUsername, password) => {
        try {
            const response = await api.post('/login', {
                emailUsername,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: true
            });

            if (response.data && response.data.token) {
                setUser(response.data);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userID', JSON.stringify(response.data.id));
                return true;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Erro ao processar a requisição';
            console.error('Erro detalhado:', errorMessage);
            return false;
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            const response = await api.get('/logout');
            if (response.status === 200) {
                setUser(null);
                localStorage.removeItem('token');
                return true;
            }

            
        } catch (error) {
            console.error('Logout falhou:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        checkAuth()
    }, [checkAuth]);

    const value = {
        user,
        login,
        logout,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


export default AuthContext;
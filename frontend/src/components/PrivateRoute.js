import { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AuthContext from '../pages/web/AuthContext.js'

const PrivateRoute = () => {
    const { user, checkAuth } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(true);
    console.log(useContext(AuthContext));

    useEffect(() => {
        // Verifica a autenticação inicial
        const verifyAuth = async () => {
            await checkAuth()
            setIsLoading(false)
        }
        verifyAuth()

        // Verifica a autenticação periodicamente
        const interval = setInterval(checkAuth, 300000) // 5 minutos

        return () => clearInterval(interval)
    }, [checkAuth])

    if (isLoading) {
        return <div>Carregando...</div>
    }

    console.log(user);

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet /> // Renderiza as rotas filhas
}

export default PrivateRoute
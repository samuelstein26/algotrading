import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './pages/web/AuthContext.js';
import { createBrowserRouter } from 'react-router-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/Header.js';
import LoginPage from './pages/web/LoginPage.js';
import LandingPage from './pages/web/LandingPage.js';
import NotFoundPage from './pages/web/NotFoundPage.js';
import RecoveryAccountPage from './pages/web/RecoveryAccountPage.js';
import ResetPasswordPage from './pages/web/ResetPasswordPage.js';
import NewUserPage from './pages/web/NewUserPage.js';
import ContactPage from './pages/web/ContactPage.js';
import InicioPage from './pages/system/InicioPage.js';
import PrivateRoute from './components/PrivateRoute.js';


const router = createBrowserRouter([
  {
      path: "/",
      element: <Header />,
      errorElement: <NotFoundPage />,
      children: [
          {
              index: true,
              element: <LandingPage />,
          },
          {
              path: "/login",
              element: <LoginPage />,
          },
          {
              path: "/recuperacaoconta",
              element: <RecoveryAccountPage />,
          },
          {
              path: "/resetarsenha",
              element: <ResetPasswordPage />,
          },
          {
              path: "/novousuario",
              element: <NewUserPage />,
          },
          {
              path: "/contato",
              element: <ContactPage />,
          },
          {
              path: "/inicio",
              //element: <InicioPage />,
              element: <PrivateRoute />,
              children: [
                  {
                      index: true,
                      element: <InicioPage />,
                  }
              ]
          },
      ],
  },
])


function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router}  />
    </AuthProvider>
  ) 
}

export default App;

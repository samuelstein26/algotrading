import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ReactComponent as Logo } from '../img/logo.svg';
import './css/Header.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../pages/web/AuthContext.js';
import { IoMdExit } from "react-icons/io";


const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const userId = localStorage.getItem('userID');

    const gotoLoginPage = () => {
        navigate('/login');
    }

    const gotoRegisterPage = () => {
        navigate('/novousuario');
    }

    const handlelogout = async () => {
        const sucess = await logout();

        if (sucess) {
            navigate('/login');
        }
    };
    const handleLogoClick = () => {
        console.log(userId);
        if (userId) {
            navigate('/inicio');
        } else {
            navigate('/');
        }
    }

    const listToLogin = ['/novousuario', '/recuperacaoconta', '/resetarsenha', '/contato'];

    const checkButtons = () => {
        if (location.pathname === '/login') {
            return (
                <Button variant="outline-dark" className="ms-2" onClick={gotoRegisterPage}>Cadastrar</Button>
            );
        }
        else if (listToLogin.includes(location.pathname)) {
            return (
                <Button variant="outline-dark" className="ms-2" onClick={gotoLoginPage}>Login</Button>
            );
        }
        else if (location.pathname === '/') {
            return (
                <>
                    <Button variant="outline-dark" className="ms-2" style={{ marginRight: '10px' }} onClick={gotoRegisterPage}>Cadastrar</Button>
                    <Button variant="outline-dark" className="ms-2" onClick={gotoLoginPage}>Login</Button>
                </>
            );
        }
        else {
            return (
                <Button
                    variant="outline-dark"
                    className="ms-2"
                    onClick={handlelogout}>
                    <IoMdExit /> Sair
                </Button>
            );
        }
    }

    return (
        <>
            <header>
                <Navbar bg="light" variant="light" expand="lg">
                    <Container>
                        <Navbar.Brand onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                            <Logo className="d-inline-block align-top logo-svg" />
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                {checkButtons()}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <hr className="separator-hr" />
            </header>
            <Outlet />
        </>
    );
};

export default Header;

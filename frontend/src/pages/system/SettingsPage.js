import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import AccountUpdate from "./components/AccountUpdate.js";
import ResetPasswordPage from "../web/ResetPasswordPage.js";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState(null);

    return (
        <div>
            <Nav className="flex-column">
                <Nav.Link onClick={() => setActiveTab('accountUpdate')}>Alterar Dados do Cadastro</Nav.Link>
                <Nav.Link onClick={() => setActiveTab('changePassword')}>Alterar Senha</Nav.Link>
            </Nav>

            {activeTab === 'accountUpdate' && <AccountUpdate />}
            {activeTab === 'changePassword' && <ResetPasswordPage shouldNavigate={false} />}
        </div>
    );
};

export default SettingsPage;
import React from "react";
import { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import ListAlgorithms from "./components/ListAlgorithms.js";
import CreateAlgorithms from "./components/CreateAlgorithms.js";
import api from "../../hooks/api.js";

const CreateAlgorithmPage = () => {
    const [active, setActive] = useState("lista");
    const userId = localStorage.getItem('userID');
    const [editKey, setEditKey] = useState(0);

    const handleGenerateCode = async (prompt) => {
        try {
            const response = await api.post('/generate-code', {
                prompt,
            });

            if (response.status === 200) {
                return (response.data.code);
            }
            return (
                console.error('Erro ao gerar código')
            );
        } catch (error) {
            console.error('Erro na API:', error);
        }
    };

    const handleSavePrompt = async (title, prompt, type, code) => {
        try {
            const response = await api.post('/create-prompt', { userId, title, content: prompt, type, code });
    
            return response.status === 200;
    
        } catch (error) {
            console.error('Erro ao salvar o prompt:', error);
            return {
                status: 500,
                message: 'Ocorreu um erro ao salvar o prompt.'
            };
        }
    };

    const handleEditPrompt = async (promptId, title, prompt, type, strategic) => {

        try {
            const response = await api.put('/update-prompt', { promptId, title, content:prompt, code:strategic });

            return response.status === 200;
        } catch (error) {
            console.error('Erro ao editar o prompt:', error);
            return {
                status: 500,
                message: 'Ocorreu um erro ao editar o prompt.'
            };
        }
    };

    const handleTabChange = (k) => {
        setActive(k);
        if (k === 'lista') {
            setEditKey(prev => prev + 1); // Muda a key para forçar recriação
        }
    };

    return (
        <Tabs
            controId="controlled-tab-example"
            activeKey={active}
            onSelect={handleTabChange}
            className="mb-3"
        >
            <Tab eventKey="lista" title="Lista">
                <ListAlgorithms
                    key={editKey}
                    onGenerateCode={handleGenerateCode}
                    onEditPrompt={handleEditPrompt}
                />
            </Tab>
            <Tab eventKey="criar" title="Criar">
                <CreateAlgorithms
                    onGenerateCode={handleGenerateCode}
                    onSavePrompt={handleSavePrompt}
                />
            </Tab>
        </Tabs>
    );
};

export default CreateAlgorithmPage;
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ReusedModal = ({ show, onHide, title, message }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title || "Sucesso!"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message || "Operação concluída com sucesso."}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReusedModal;
import React from 'react';
import { Row, Col } from 'react-bootstrap';

const CopyRight = () => {
    return (
        <Row className="pt-3 bg-dark text-light py-2">
          <Col className="text-center">
            <p>&copy; {new Date().getFullYear()} AlgoTrading Sistema. Todos os direitos reservados.</p>
          </Col>
        </Row>
    );
}

export default CopyRight;
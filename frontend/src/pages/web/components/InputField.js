import React from "react";
import { Form, InputGroup } from 'react-bootstrap';

const InputField = (props) => {

    return (
        <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1" style={{width: '150px'}}>{props.name+':'}</InputGroup.Text>
            <Form.Control
                aria-label={props.name}
                aria-describedby="basic-addon1"
            />
        </InputGroup>
    )
}

export default InputField;
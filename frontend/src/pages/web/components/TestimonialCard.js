import React from "react";
import { Card } from 'react-bootstrap';
import '../css/TestimonialCard.css';

const TestimonialCards = (props) => {
    return (
        <Card className="text-center">
            <Card.Img variant="top" src={props.image} alt="User Testimonial" className="testimonial-card"/>
            <Card.Body>
                <Card.Text>{props.message}</Card.Text>
                <Card.Subtitle className="text-muted">{props.name}</Card.Subtitle>
            </Card.Body>
        </Card>
    )
}

export default TestimonialCards;
import { Card, Form } from 'react-bootstrap';

// Text area for the "Text to preprocess" input
function PreprocessTextArea({ value, onChange }) {
    return (
        <Card className="panel">
            <Card.Body className="p-2">
                <Form.Control
                    as="textarea"
                    id="proc"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="mono"
                    style={{ height: '38vh', resize: 'vertical' }}
                />
            </Card.Body>
        </Card>
    )
}
export default PreprocessTextArea;
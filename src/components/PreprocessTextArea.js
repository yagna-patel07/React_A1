import { Card, Form } from 'react-bootstrap';
function PreprocessTextArea({ value, onChange }) {
    return (
        <Card className="panel">
            <Card.Header className="fw-semibold">Text to preprocess</Card.Header>
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
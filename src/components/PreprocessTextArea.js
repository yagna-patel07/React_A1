import { Form } from 'react-bootstrap';
function PreprocessTextArea({ value, onChange }) {
    return (
        <>
            <Form.Label>Text to preprocess:</Form.Label>
            <Form.Control
                as="textarea"
                rows={15}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                id="proc"
            />
        </>
    )
}
export default PreprocessTextArea;
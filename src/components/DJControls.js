import { Card, Form } from 'react-bootstrap';
function DJControls({ mode, onModeChange }) {
    return (
        <Card className="panel mt-3">
            <Card.Body>
                <Form>
                    <Form.Check
                        type="radio"
                        name="p1"
                        id="p1-on"
                        label="p1: ON"
                        className="mb-2"
                        checked={mode === "on"}
                        onChange={() => onModeChange("on")}
                    />
                    <Form.Check
                        type="radio"
                        name="p1"
                        id="p1-hush"
                        label="p1: HUSH"
                        checked={mode === "hush"}
                        onChange={() => onModeChange("hush")}
                    />
                </Form>
            </Card.Body>
        </Card>
    )
}
export default DJControls;
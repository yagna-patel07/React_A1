import { Card, Form } from 'react-bootstrap';
function DJControls() {
    return (
        <Card className="panel mt-3">
            <Card.Body>
                <Form>
                    <Form.Check
                        type="radio"
                        name="p1"
                        id="flexRadioDefault1"
                        label="p1: ON"
                        defaultChecked
                        className="mb-2"
                    />
                    <Form.Check
                        type="radio"
                        name="p1"
                        id="flexRadioDefault2"
                        label="p1: HUSH"
                    />
                </Form>
            </Card.Body>
        </Card>
    )
}
export default DJControls;
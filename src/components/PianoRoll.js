import { Card } from 'react-bootstrap';
function PianoRoll() {
    return (
        <Card className="panel mt-3">
            <Card.Body>
                <canvas id="roll" style={{ width: '100%', height: 240 }} />
            </Card.Body>
        </Card>
    )
}
export default PianoRoll;

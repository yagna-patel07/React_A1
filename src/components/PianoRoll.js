import { Card } from 'react-bootstrap';

// Piano roll visual: Strudel draws notes into this canvas
function PianoRoll() {
    return (
        <Card className="panel mt-3">
            <Card.Body>
                {/* Canvas picked up by Strudel setup in App.js */}
                <canvas id="roll" style={{ width: '100%', height: 240 }} />
            </Card.Body>
        </Card>
    )
}
export default PianoRoll;

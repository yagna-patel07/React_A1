import { Card, Form, InputGroup } from "react-bootstrap";

export default function MixerPanel({
    cpm, onCpm,               
    volume, onVolume,         
    toggles, onToggle        
}) {
    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title className="h6 mb-3">Mixer</Card.Title>

                {/* CPM */}
                <Form.Group className="mb-3" controlId="cpmInput">
                    <Form.Label>Cycles per minute (CPM)</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>CPM</InputGroup.Text>
                        <Form.Control
                            type="number" min={10} max={480} step={1}
                            value={cpm} onChange={e => onCpm(Number(e.target.value || 0))}
                        />
                    </InputGroup>
                </Form.Group>

                {/* Volume */}
                <Form.Group className="mb-3" controlId="volumeRange">
                    <Form.Label>Master Volume: {volume.toFixed(2)}</Form.Label>
                    <Form.Range min={0} max={1} step={0.01}
                        value={volume} onChange={e => onVolume(Number(e.target.value))}
                    />
                </Form.Group>

                {/* Instrument toggles */}
                <Form.Group>
                    <Form.Label className="mb-2 d-block">Instruments</Form.Label>
                    <Form.Check type="checkbox" id="toggleD1" label="D1 (Drums 1)"
                        checked={toggles.D1} onChange={e => onToggle('D1', e.target.checked)} />
                    <Form.Check type="checkbox" id="toggleD2" label="D2 (Drums 2)"
                        checked={toggles.D2} onChange={e => onToggle('D2', e.target.checked)} />
                    <Form.Check type="checkbox" id="toggleS1" label="S1 (Sample 1)"
                        checked={toggles.S1} onChange={e => onToggle('S1', e.target.checked)} />
                </Form.Group>
            </Card.Body>
        </Card>
    );
}

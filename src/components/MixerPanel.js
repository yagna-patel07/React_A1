import { Card, Form, InputGroup } from "react-bootstrap";

// Mixer panel: controls CPM (speed) and master volume
export default function MixerPanel({ cpmText, onCpmText, volume, onVolume}) {
    return (
        <Card className="panel">
            <Card.Body>
                <Card.Title>Mixer</Card.Title>

                {/* Wrap inputs in a form but prevent any submit refresh */}
                <Form onSubmit={(e) => e.preventDefault()}>
                    {/* CPM input with a small prefix label */}
                    <Form.Label>Cycles per minute (CPM)</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>CPM</InputGroup.Text>
                        <Form.Control
                            type="text"                
                            inputMode="numeric"        
                            pattern="[0-9]*"
                            value={cpmText}
                            onChange={(e) => onCpmText(e.target.value)}
                            placeholder="e.g. 120"
                            aria-label="Cycles per minute"
                        />
                    </InputGroup>

                    {/* Master volume slider, shows current value */}
                    <Form.Label>Master Volume: {volume.toFixed(2)}</Form.Label>
                    <Form.Range
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => onVolume(Number(e.target.value))}
                        className="form-range"
                    />
                </Form>
            </Card.Body>
        </Card>
    );
}

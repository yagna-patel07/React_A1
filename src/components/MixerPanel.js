import { Card, Form, InputGroup } from "react-bootstrap";

export default function MixerPanel({ cpmText, onCpmText, volume, onVolume, toggles, onToggle}) {
    return (
        <Card className="panel">
            <Card.Body>
                <Card.Title>Mixer</Card.Title>

                <Form onSubmit={(e) => e.preventDefault()}>
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

                    <Form.Label>Master Volume: {volume.toFixed(2)}</Form.Label>
                    <Form.Range
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => onVolume(Number(e.target.value))}
                        className="form-range"
                    />

                    <Form.Label>Instruments</Form.Label>
                    <div className="d-flex flex-column gap-1">
                        {[
                            { k: 'D1', label: 'D1 (Drums 1)' },
                            { k: 'D2', label: 'D2 (Drums 2)' },
                            { k: 'S1', label: 'S1 (Sample 1)' },
                        ].map(({ k, label }) => (
                            <Form.Check
                                key={k}
                                id={`mix-${k}`}
                                type="checkbox"
                                label={label}
                                checked={!!toggles[k]}
                                onChange={(e) => onToggle(k, e.target.checked)}
                            />
                        ))}
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

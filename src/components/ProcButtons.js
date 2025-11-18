import { ButtonGroup, Button } from 'react-bootstrap';

// Buttons for running preprocessing only, or preprocess + play in one step
function ProcButtons({ onProc, onProcPlay }) {
    return (
        <ButtonGroup className="mb-3 me-2">
            {/* Run preprocessing and update editor, but don’t start audio */}
            <Button variant="outline-primary" onClick={onProc}>Preprocess</Button>
            {/* Preprocess and immediately start playback */}
            <Button variant="outline-primary" onClick={onProcPlay}>Proc &amp; Play</Button>
        </ButtonGroup>
        
    )
}
export default ProcButtons;
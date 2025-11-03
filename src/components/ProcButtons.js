
import { ButtonGroup, Button } from 'react-bootstrap';
function ProcButtons({ onProc, onProcPlay }) {
    return (
        <ButtonGroup className="mb-3 me-2">
            <Button variant="outline-primary" onClick={onProc}>Preprocess</Button>
            <Button variant="outline-primary" onClick={onProcPlay}>Proc &amp; Play</Button>
        </ButtonGroup>
        
    )
}
export default ProcButtons;
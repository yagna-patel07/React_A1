import { Form } from "react-bootstrap";

const KITS = ["RolandTR808", "OberheimDmx", "KorgDDM110", "LinnDrum", "CasioRZ1"];

// Dropdown for choosing a drum kit name
export default function KitSelect({ kit, onKit }) {
    return (
        <>
            {/* Label for the drum kit selector */}
            <Form.Label>Drum Kit</Form.Label>

            {/* Select lets the user override the song’s default kit */}
            <Form.Select value={kit} onChange={(e) => onKit(e.target.value)}>
                <option value="">(Song Default)</option>
                {KITS.map(k => <option key={k} value={k}>{k}</option>)}
            </Form.Select>
        </>
    );
}
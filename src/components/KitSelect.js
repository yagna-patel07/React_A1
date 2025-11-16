import { Form } from "react-bootstrap";

const KITS = ["RolandTR808", "OberheimDmx", "KorgDDM110", "LinnDrum", "CasioRZ1"];

export default function KitSelect({ kit, onKit }) {
    return (
        <>
            <Form.Label>Drum Kit</Form.Label>
            <Form.Select value={kit} onChange={(e) => onKit(e.target.value)}>
                <option value="">(Song Default)</option>
                {KITS.map(k => <option key={k} value={k}>{k}</option>)}
            </Form.Select>
        </>
    );
}
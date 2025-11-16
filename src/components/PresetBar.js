import { Button, ButtonGroup } from "react-bootstrap";

export default function PresetBar({ stateForSave, onLoadJson, onReset }) {
    const handleSave = () => {
        const blob = new Blob(
            [JSON.stringify(stateForSave ?? {}, null, 2)],
            { type: "application/json" }
        );
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "strudel-preset.json";
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const handleLoad = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            file.text().then(txt => {
                try { onLoadJson(JSON.parse(txt)); }
                catch { alert("Invalid preset file"); }
            });
        };
        input.click();
    };

    return (
        <ButtonGroup className="w-100">
            <Button variant="outline-primary" onClick={handleSave}>Save Preset</Button>
            <Button variant="outline-primary" onClick={handleLoad}>Load Preset</Button>
            <Button variant="outline-danger" onClick={onReset}>Reset</Button>
        </ButtonGroup>
    );
}
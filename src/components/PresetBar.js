import { Button, ButtonGroup } from "react-bootstrap";

// JSON preset toolbar: save current state, load from file, or reset
export default function PresetBar({ stateForSave, onLoadJson, onReset }) {
    // Download current UI state as a JSON file
    const handleSave = () => {
        const blob = new Blob(
            [JSON.stringify(stateForSave ?? {}, null, 2)], // pretty-printed JSON
            { type: "application/json" }
        );
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "strudel-preset.json";
        a.click();
        URL.revokeObjectURL(a.href); // cleanup
    };

    // Load a JSON file from disk
    const handleLoad = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            file.text().then(txt => {
                try { onLoadJson(JSON.parse(txt)); } // let parent apply the preset
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
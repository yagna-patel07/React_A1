import { Card } from 'react-bootstrap';

// Host card for the Strudel editor + console output
function EditorHost() {
    return (
        <Card className="panel mt-3">
            <Card.Body className="p-0">
                {/* StrudelMirror mounts into this div by ID */}
                <div id="editor" className="editor-pane" />
                {/* Optional console / log output area */}
                <div id="output" className="p-2 small text-muted" />
            </Card.Body>
        </Card>
    );
}

export default EditorHost;
import { Card } from 'react-bootstrap';
function EditorHost() {
    return (
        <Card className="panel mt-3">
            <Card.Body className="p-0">
                <div id="editor" className="editor-pane" />
                <div id="output" className="p-2 small text-muted" />
            </Card.Body>
        </Card>
    );
}

export default EditorHost;
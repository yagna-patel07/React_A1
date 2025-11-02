import { Card } from 'react-bootstrap';
function EditorHost() {
    return (
        <Card className="panel">
            <Card.Body>
                <div id="editor" />
                <div id="output" className="mt-3" />
            </Card.Body>
        </Card>
    );
}

export default EditorHost;
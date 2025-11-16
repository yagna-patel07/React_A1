import { Toast, ToastContainer } from "react-bootstrap";

export default function AlertToast({ show, onHide, message = "Something happened" }) {
    return (
        <ToastContainer position="bottom-end" className="p-3">
            <Toast bg="danger" onClose={onHide} show={show} delay={2200} autohide>
                <Toast.Header closeButton={false}><strong className="me-auto">Alert</strong></Toast.Header>
                <Toast.Body className="text-white">{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
}
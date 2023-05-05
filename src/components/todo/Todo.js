import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const Todo = ({ todo, admin, onDelete, onEdit, onFinished }) => {
    const [currName, setCurrName] = useState(todo.todoname);
    const [deleteModal, setDeleteModal] = useState(false);

    const renderValue = () => {
        if(todo.edit){
            return (
                <Form.Control
                    value={currName}
                    onChange={(e) => setCurrName(e.target.value)}
                    disabled={!admin}
                />
            );
        }
        else {
            return (currName);
        }
    };

    const editButton = () => {
        if(todo.edit){
            return (
                <>
                    <Button
                        variant="success"
                        onClick={() => onEdit(todo, currName)}
                        disabled={!admin}
                    >
                        Ok
                    </Button>
                </>
            );
        }
        else {
            return (
                <>
                    <Button
                        variant="primary"
                        onClick={() => onEdit(todo)}
                        disabled={!admin}
                    >
                        Edit
                    </Button>
                </>
            );
        }
    };
    
    return (
        <>
            <Modal
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete todo?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to delete this todo?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteModal(false)}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={() => {
                        setDeleteModal(false);
                        return onDelete(todo);
                    }}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <tr className="align-middle">
                <td className="ps-3">{renderValue()}</td>
                <td>
                    <Form.Check
                        type="switch"
                        className="text-center"
                        defaultChecked={todo.finished}
                        onClick={() => onFinished(todo)}
                    />
                </td>
                <td className="text-center">
                    {editButton()}
                </td>
                <td className="text-center">
                    <Button 
                        variant="danger"
                        onClick={() => setDeleteModal(true)}
                        disabled={!admin}
                    >
                        Delete
                    </Button>
                </td>
            </tr>
        </>
    );
};
 
export default Todo;
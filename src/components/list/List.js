import { useContext, useEffect, useMemo, useState } from "react";
import { Accordion, Button, Card, Form, Table, Tabs, Tab, Modal } from "react-bootstrap";
import { StateContext } from "../../context/StateContext";
import Todo from "../todo/Todo";

const List = ({ list, getLists }) => {
    const {token, setSucc, setErr} = useContext(StateContext);

    const [newItem, setNewItem] = useState("");
    const [currListName, setCurrListName] = useState(list.listname);
    const [admin, setAdmin] = useState(false);
    const [form, setForm] = useState({
        name: "",
        role: "0"
    });
    const [leaveModal, setLeaveModal] = useState(false);
    const [listModal, setListModal] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);

    const todosCalc = useMemo(() => list.todos.length, [list.todos]);

    useEffect(() => {
        isAdmin();
        getUsers();
        getAdmins();
    }, []);

    const isAdmin = async() => {
        const res = await fetch("http://localhost:5000/list/admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                id: list.db_id
            })
        });

        const data = await res.json();
        if(!data.success){
            return setErr(data.message);
        }

        setAdmin(data.success);
    };

    const getAdmins = async() => {
        const res = await fetch("http://localhost:5000/list/admins/"+list.db_id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();
        if(!data.success){
            return setErr(data.message);
        }

        setAdmins([]);
        
        data.admins.map(async(admin) => {
            const res = await fetch("http://localhost:5000/user/fromid/"+admin.userid, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            if(!data.success){
                return setErr(data.message);
            }

            setAdmins(current => [...current, data.user.username]);
        });
    };

    const getUsers = async() => {
        const res = await fetch("http://localhost:5000/list/users/"+list.db_id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setUsers([]);
        
        data.users.map(async(user) => {
            const res = await fetch("http://localhost:5000/user/fromid/"+user.userid, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            if(!data.success){
                setSucc("");
                return setErr(data.message);
            }

            setUsers(current => [...current, data.user.username]);
        });
    };

    const handleAddTodo = async() => {
        if(newItem === ""){
            setSucc("");
            return setErr("Todo name is required");
        }
        if(newItem.length < 3){
            setSucc("");
            return setErr("The todo name has to be at least 3 characters");
        }

        const res = await fetch("http://localhost:5000/list/todo/add/"+list.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                todoname: newItem
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        setSucc("You successfully added a todo to the list");
        getLists();
        setNewItem("");
    };

    const handleDeleteList = async() => {
        const res = await fetch("http://localhost:5000/list/delete/"+list.db_id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        setSucc("You successfully deleted the list");
        getLists();
    };

    const handleDeleteTodo = async(todo) => {
        const res = await fetch("http://localhost:5000/list/todo/delete/"+list.db_id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                todoid: todo._id
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        setSucc("You successfully deleted the todo from the list");
        getLists();
    };

    const handleEditList = async() => {
        const res = await fetch("http://localhost:5000/list/edit/"+list.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                newlistname: currListName
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        if(data.edited){
            setErr("");
            setSucc("You successfully edited the name of the list");
        }

        getLists();
    };

    const handleFinished = async(todo) => {
        const res = await fetch("http://localhost:5000/list/todo/finished/"+list.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                todoid: todo._id,
                finished: !todo.finished
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        getLists();
    };

    const handleEditTodo = async(todo, currName) => {
        const res = await fetch("http://localhost:5000/list/todo/edit/"+list.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                todoid: todo._id,
                newtodoname: currName,
                edit: !todo.edit
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        if(data.edited){
            setErr("");
            setSucc("You successfully edited the name of the todo");
        }
        getLists();
    };

    const handleInvite = async() => {
        if(form.name === ""){
            setSucc("");
            return setErr("Username is required");
        }

        const res = await fetch("http://localhost:5000/user/invite/"+list.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                name: form.name,
                admin: (form.role === "1"),
                listname: list.listname
            })
        });

        const data = await res.json();
        
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }
        
        setForm({
            name: "",
            role: "0"
        });
        
        setErr("");
        setSucc("Invite sent");
    };

    const handleKick = async() => {
        if(form.name === ""){
            setSucc("");
            return setErr("Username is required");
        }

        const res = await fetch("http://localhost:5000/list/kick/"+list.db_id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                name: form.name
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        setForm({
            name: "",
            role: "0"
        });
        getUsers();
        
        setSucc("User kicked from the list");
    };

    const handleLeaveList = async(admin) => {
        if(admin && admins.length === 1){
            return setLeaveModal(true);
        }
        const res = await fetch("http://localhost:5000/list/leave/"+list.db_id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                admin: admin
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        getLists();

        setSucc("You left the list");
    };

    const renderListname = () => {
        if(list.edit){
            return (
                <>
                    <Form.Control
                        type="text"
                        value={currListName}
                        onChange={(e) => setCurrListName(e.target.value)}
                    />
                </>
            );
        }
        else {
            return (list.listname);
        }
    };

    const renderEditButton = () => {
        if(list.edit){
            return (
                <>
                    <Button
                        size="sm"
                        className="me-3"
                        variant="success"
                        onClick={handleEditList}
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
                        size="sm"
                        className="me-3"
                        onClick={handleEditList}
                    >
                        Edit
                    </Button>
                </>
            );
        }
    };

    const renderAdminPanel = () => {
        if(admin){
            return (
                <>
                    <Card className="mb-3">
                        <Card.Header
                            style={{fontWeight: 600}}
                            className="d-flex justify-content-between align-middle"
                        >
                            <span>{renderListname()}</span>
                            <div>
                                {renderEditButton()}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setListModal(true)}
                                >
                                    Delete
                                </Button>
                                <Modal
                                    show={listModal}
                                    onHide={() => setListModal(false)}
                                    backdrop="static"
                                    keyboad={false}
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>Delete list?</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        Do you want to delete this list?
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setListModal(false)}>
                                            Close
                                        </Button>
                                        <Button variant="danger" onClick={() => {
                                            setListModal(false);
                                            return handleDeleteList();
                                        }}>
                                            Delete
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Tabs defaultActiveKey="add" justify>
                                <Tab
                                    eventKey="add"
                                    title="Add todo"
                                >
                                    <Form className="d-flex mt-3 px-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="Add new todo"
                                            style={{width: "50%"}}
                                            className="me-auto"
                                            value={newItem}
                                            onChange={(e) => setNewItem(e.target.value)}
                                        />
                                        <Button
                                            variant="success"
                                            onClick={handleAddTodo}
                                        >
                                            Add
                                        </Button>
                                    </Form>
                                </Tab>
                                <Tab
                                    eventKey="invite"
                                    title="Invite"
                                >
                                    <Form className="d-flex mt-3 px-3">
                                        <Form.Control 
                                            type="text"
                                            size="sm"
                                            style={{width: "50%"}}
                                            placeholder="Username"
                                            value={form.name}
                                            onChange={(e) => setForm({
                                                name: e.target.value,
                                                role: form.role
                                            })}
                                        />
                                        <Form.Select 
                                            size="sm"
                                            style={{width: "20%"}}
                                            className="ms-2 me-auto"
                                            value={form.role}
                                            onChange={(e) => setForm({
                                                name: form.name,
                                                role: e.target.value
                                            })}
                                        >
                                            <option value="0">User</option>
                                            <option value="1">Admin</option>
                                        </Form.Select>
                                        <Button onClick={handleInvite}>Send invite</Button>
                                    </Form>
                                </Tab>
                                <Tab
                                    eventKey="kick"
                                    title="Kick"
                                >
                                    <Form className="d-flex mt-3 px-3">
                                        <Form.Control 
                                            type="text"
                                            size="sm"
                                            style={{width: "50%"}}
                                            className="me-auto"
                                            placeholder="Username"
                                            value={form.name}
                                            onChange={(e) => setForm({
                                                name: e.target.value,
                                                role: form.role
                                            })}
                                        />
                                        <Button variant="danger" onClick={handleKick}>Kick user</Button>
                                    </Form>
                                </Tab>
                                <Tab
                                    eventKey="users"
                                    title="Users"
                                >
                                    <div className="d-flex">
                                    <Table striped hover>
                                        <thead>
                                            <tr>
                                                <th>Admins</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {admins.map((name, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td>{name}</td>
                                                    </tr>
                                                );   
                                            })}
                                        </tbody>
                                    </Table>
                                    <div className="vr" />
                                    <Table striped hover>
                                        <thead>
                                            <tr>
                                                <th>Users</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((name, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td>{name}</td>
                                                    </tr>
                                                );   
                                            })}
                                        </tbody>
                                    </Table>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </>
            );
        }
    };

    return (
        <>
            <Accordion.Item eventKey={list.id}>
                <Accordion.Header>{list.listname}</Accordion.Header>
                <Accordion.Body>
                    {renderAdminPanel()}
                    <Button variant="danger" onClick={() => handleLeaveList(admin)}>Leave list</Button>
                    <Modal
                        show={leaveModal}
                        onHide={() => setLeaveModal(false)}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Delete list?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            You are the only admin in this list. Do you want to delete this list?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setLeaveModal(false)}>
                                Close
                            </Button>
                            <Button variant="danger" onClick={handleDeleteList}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    {
                        todosCalc === 0 ?
                            <>
                                <p className="text-center">
                                    You don't have any todos.
                                </p>
                                <p className="text-center">
                                    If you are an admin you can create the first todo by the admin panel.
                                </p>
                            </>
                        :
                            <Table striped hover>
                                <thead>
                                    <tr>
                                        <th className="ps-3">Title</th>
                                        <th className="text-center">Finished</th>
                                        <th></th>
                                        <th className="text-center">{todosCalc} todos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.todos.map((todo, i) => {
                                        return (
                                            <Todo 
                                                key={i}
                                                todo={todo}
                                                admin={admin}
                                                onDelete={handleDeleteTodo}
                                                onFinished={handleFinished}
                                                onEdit={handleEditTodo}
                                            />
                                        );
                                    })}
                                </tbody>
                            </Table>
                    }
                </Accordion.Body>
            </Accordion.Item>
        </>
    );
};

export default List;
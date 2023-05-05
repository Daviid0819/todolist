import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { Button, Form, Dropdown, DropdownButton, Spinner } from "react-bootstrap";
import { StateContext } from "../../context/StateContext";

const Header = ({ page, onGetTodos, onGetLists }) => {
    const {search, setSearch, show, setShow, token, setToken, setErr} = useContext(StateContext);
    
    const [newItem, setNewItem] = useState("");
    const [clear, setClear] = useState(true);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setShow("0");
    }, [])

    useEffect(() => {
        search !== "" || show !== "0" ? setClear(false) : setClear(true);
    }, [search, show]);

    const handleNewItem = async() => {
        setLoading(true);
        if(page === "home") {
            const res = await fetch("http://localhost:5000/user/todo/add", {
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
                setLoading(false);
                return setErr(data.message);
            }

            onGetTodos();
            setNewItem("");
            setLoading(false);
        }
        else if(page === "lists"){
            const res = await fetch("http://localhost:5000/list/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    auth: token
                },
                body: JSON.stringify({
                    listname: newItem
                })
            });

            const data = await res.json();

            if(!data.success){
                setLoading(false);
                return setErr(data.message);
            }

            onGetLists();
            setNewItem("");
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearch("");
        setShow("0");
    };

    const handleLogout = () => {
        setToken("");
    };

    const renderHeader = () => {
        if(page === "home"){
            return (
                <>
                    <Form.Control
                        type="text"
                        className="search"
                        size="sm"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Form.Select
                        className="show"
                        size="sm"
                        value={show}
                        onChange={(e) => setShow(e.target.value)}
                    >
                        <option value="0">All</option>
                        <option value="1">Finished</option>
                        <option value="2">Not finished</option>
                    </Form.Select>
                    <Button
                        variant="dark"
                        size="sm"
                        onClick={handleClear}
                        disabled={clear}
                    >
                        Clear
                    </Button>
                    <Form.Control
                        type="text"
                        className="newiteminput"
                        size="sm"
                        placeholder="New todo name"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                    />
                    <Button
                        variant="dark"
                        size="sm"
                        className="newitembutton"
                        onClick={handleNewItem}
                        disabled={!newItem || loading /*!(newItem.length>2)*/}
                    >
                        {loading ?
                            <>
                                <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-1"
                                />
                                Add new todo
                            </>
                        :
                            <>Add new todo</>
                        }
                    </Button>
                    <DropdownButton variant="dark" title="Profile" className="me-3">
                        <Dropdown.Item onClick={() => navigate("/home")}>Home</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/lists")}>Lists</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/invites")}>Invites</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </DropdownButton>
                </>
            );
        }
        else if(page === "settings" || page === "invites"){
            return (
                <>
                    <DropdownButton variant="dark" title="Profile" className="ms-auto me-3">
                        <Dropdown.Item onClick={() => navigate("/home")}>Home</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/lists")}>Lists</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/invites")}>Invites</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </DropdownButton>
                </>
            );
        }
        else if(page === "lists"){
            return (
                <>
                    <Form.Control
                        type="text"
                        className="search"
                        size="sm"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Form.Select
                        className="show"
                        size="sm"
                        value={show}
                        onChange={(e) => setShow(e.target.value)}
                    >
                        <option value="0">All</option>
                        <option value="1">Admin</option>
                        <option value="2">User</option>
                    </Form.Select>
                    <Button
                        variant="dark"
                        size="sm"
                        onClick={handleClear}
                        disabled={clear}
                    >
                        Clear
                    </Button>
                    <Form.Control
                        type="text"
                        className="newiteminput"
                        size="sm"
                        placeholder="New list name"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                    />
                    <Button
                        variant="dark"
                        size="sm"
                        className="newitembutton"
                        onClick={handleNewItem}
                        disabled={!newItem /*!(newItem.length>2)*/}
                    >
                        {loading ?
                            <>
                                <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-1"
                                />
                                Add new list
                            </>
                        :
                            <>Add new list</>
                        }
                    </Button>
                    <DropdownButton variant="dark" title="Profile" className="me-3">
                        <Dropdown.Item onClick={() => navigate("/home")}>Home</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/lists")}>Lists</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/invites")}>Invites</Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </DropdownButton>
                </>
            );
        }
    };

    return (
        <div className="header">
            <h3>TodoList</h3>
            {renderHeader()}
        </div>
    );
};

export default Header;
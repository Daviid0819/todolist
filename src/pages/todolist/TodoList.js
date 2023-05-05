import { useState, useEffect, useContext, useMemo } from "react";
import Todo from "../../components/todo/Todo";
import { StateContext } from "../../context/StateContext";
import { useNavigate } from "react-router-dom";
import { Alert, Container, Spinner, Table } from "react-bootstrap";
import useDebounce from "../../hooks/useDebounce";
import Header from "../../layouts/header/Header";

const TodoList = () => {
    const {show, search, setSearch, token, err, setErr, succ, setSucc} = useContext(StateContext);

    const [todos, setTodos] = useState([]);
    const [showTodos, setShowTodos] = useState([...todos]);
    const [showSearch, setShowSearch] = useState(search);
    const [loading, setLoading] = useState(false);

    const todosCalc = useMemo(() => showTodos.length, [showTodos]);

    const navigate = useNavigate();

    useEffect(() => {
        if(!token) {
            navigate("/");
        }
        else {
            setLoading(true);
            setErr("");
            setSucc("");
            setSearch("");
            getTodos();
            setLoading(false);
        }
    }, [token]);
    
    // Search debounce
    useDebounce(() => {
        setShowSearch(search);
    }, [search], 500);

    /*useEffect(() => {
        const timeout = setTimeout(() => {
            setShowSearch(search);
        }, 600);
        return () => clearTimeout(timeout);
    }, [search]);*/

    useEffect(() => {
        if(showSearch[showSearch.length-1] !== "\\" && showSearch[showSearch.length-1] !== "(" &&
        showSearch[showSearch.length-1] !== ")" && showSearch[showSearch.length-1] !== "[" &&
        showSearch[showSearch.length-1] !== "]" && showSearch[showSearch.length-1] !== "{" &&
        showSearch[showSearch.length-1] !== "}"){
            const rx = new RegExp(`${showSearch}`,'i');
            switch(show){
                case "0":
                    setShowTodos(todos.slice(0).reverse().filter(elem => rx.test(elem.todoname)));
                    break;
                case "1":
                    setShowTodos(todos.slice(0).reverse().filter(elem => elem.finished === true && rx.test(elem.todoname)));
                    break;
                case "2":
                    setShowTodos(todos.slice(0).reverse().filter(elem => elem.finished === false && rx.test(elem.todoname)));
                    break;
                default:
                    setShowTodos(todos.slice(0).reverse().filter(elem => rx.test(elem.todoname)));
                    break;
            }
        }
        else {
            setSucc("");
            setErr("You can't search for this symbol");
            setSearch("");
        }
    }, [todos, show, showSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSucc("");
        }, 10000);
        return () => clearTimeout(timer);
    }, [succ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setErr("");
        }, 10000);
        return () => clearTimeout(timer);
    }, [err]);

    const getTodos = async() => {
        const res = await fetch("http://localhost:5000/user/todo", {
            method: "GET",
            headers: {
                auth: token
            }
        });

        const data = await res.json();

        /*if(data.status === "error"){
            setLoading(false);
            return alert(data.message);
        }*/
        
        if(data.todos){
            setTodos(data.todos.map((todo, i) => ({
                db_id: todo._id,
                id: i+1,
                todoname: todo.todoname,
                finished: todo.finished,
                edit: todo.edit
            })));
        }
    };

    const handleDelete = async(todo) => {
        const res = await fetch("http://localhost:5000/user/todo/delete/"+todo.db_id, {
            method: "DELETE",
            headers: {
                "Conetent-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        setSucc("You successfully deleted the todo");
        getTodos();
    };

    const handleEdit = async(todo, currName) => {
        const res = await fetch("http://localhost:5000/user/todo/edit/"+todo.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                edit: !todo.edit,
                newtodoname: currName
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        if(data.edited){
            setSucc("You successfully edited the name of the todo");
        }
        getTodos();
    };

    const handleFinished = async(todo) => {
        const res = await fetch("http://localhost:5000/user/todo/finished/"+todo.db_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                finished: !todo.finished
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }

        setErr("");
        getTodos();
    };

    const handleErr = () => {
        if(err){
            return (
                <>
                    <Alert
                        style={{width: "70%"}}
                        className="text-center ms-auto me-auto"
                        variant="danger"
                        onClose={() => setErr("")}
                        dismissible
                    >
                        {err}
                    </Alert>
                </>
            );
        }
        if(succ){
            return (
                <>
                    <Alert
                        style={{width: "70%"}}
                        className="text-center ms-auto me-auto"
                        variant="success"
                        onClose={() => setSucc("")}
                        dismissible
                    >
                        {succ}
                    </Alert>
                </>
            );
        }
    };

    return (
        <>
            <Header page="home" onGetTodos={getTodos}/>
            {loading ?
                <Container className="d-flex justify-content-center">
                    <Spinner className="mt-5" animation="border" />
                </Container>
            :
                <Container>
                    {handleErr()}
                    {
                        todosCalc === 0 ?
                            showSearch === "" && show === "0" ?
                                <>
                                    <p className="text-center">
                                        You don't have any todos.
                                    </p>
                                    <p className="text-center">
                                        Create your first todo by the input field on the header.
                                    </p>
                                </>
                            :
                                <>
                                    <p className="text-center">
                                        You don't have any todos with these conditions.
                                    </p>
                                </>
                        :
                            <Table striped hover>
                                <thead>
                                    <tr className="align-middle">
                                        <th className="col-md-6 ps-3">Title</th>
                                        <th className="text-center">Finished</th>
                                        <th></th>
                                        <th className="text-center">{todosCalc} todos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        showTodos.map(todo => 
                                            <Todo 
                                                key = {todo.id}
                                                todo = {todo}
                                                admin = {true}
                                                onDelete = {handleDelete}
                                                onFinished = {handleFinished}
                                                onEdit = {handleEdit}
                                            />  
                                        )
                                    }
                                </tbody>
                            </Table>
                    }
                </Container>
            }
        </>
    );
};
 
export default TodoList;
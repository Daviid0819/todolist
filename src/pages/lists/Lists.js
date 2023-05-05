import { useContext, useEffect, useMemo, useState } from "react";
import { Accordion, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { StateContext } from "../../context/StateContext";
import useDebounce from "../../hooks/useDebounce";
import List from "../../components/list/List";
import Header from "../../layouts/header/Header";

const Lists = () => {
    const {token, search, setSearch, succ, setSucc, err, setErr, show} = useContext(StateContext);

    const [lists, setLists] = useState([]);
    const [showLists, setShowLists] = useState([...lists]);
    const [showSearch, setShowSearch] = useState(search);
    const [loading, setLoading] = useState(false);
    const [uid, setUid] = useState();

    const navigate = useNavigate();

    const listsCalc = useMemo(() => showLists.length, [showLists]);

    useEffect(() => {
        getUid()
            .then(res => setUid(res))
            .catch(err => console.log(err));

        if(!token) {
            navigate("/");
        }
        else {
            setLoading(true);
            setErr("");
            setSucc("");
            setSearch("");
            getLists();
            setLoading(false);
        }
    }, [token]);

    useDebounce(() => {
        setShowSearch(search);
    }, [search], 500);

    useEffect(() => {
        if(showSearch[showSearch.length-1] !== "\\" && showSearch[showSearch.length-1] !== "(" &&
        showSearch[showSearch.length-1] !== ")" && showSearch[showSearch.length-1] !== "[" &&
        showSearch[showSearch.length-1] !== "]" && showSearch[showSearch.length-1] !== "{" &&
        showSearch[showSearch.length-1] !== "}"){
            const rx = new RegExp(`${showSearch}`,'i');
            switch(show){
                case "0":
                    setShowLists(lists.slice(0).reverse().filter(list => rx.test(list.listname)));
                    break;
                case "1":
                    setShowLists(lists.slice(0).reverse().filter(list => list.admins.map(admin => admin.userid) == uid && rx.test(list.listname)));
                    break;
                case "2":
                default:
                    setShowLists(lists.slice(0).reverse().filter(list => list.users.map(user => user.userid) == uid && rx.test(list.listname)));
                    break;
            }
        }
        else {
            setSucc("");
            setErr("You can't search for this symbol");
            setSearch("");
        }
    }, [lists, showSearch, show]);

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

    const getUid = async() => {
        const res = await fetch("http://localhost:5000/user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();
        return data.user._id;
    };

    const getLists = async() => {
        const res = await fetch("http://localhost:5000/list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();

        if(data.lists){
            setLists(data.lists.map((list, i) => ({
                db_id: list._id,
                id: i+1,
                listname: list.listname,
                edit: list.edit,
                todos: list.todos,
                users: list.users,
                admins: list.admins
            })));
        }
    };

    const handleMsg = () => {
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
            <Header page="lists" onGetLists={getLists}/>
            {loading ?
                <Container className="d-flex justify-content-center">
                    <Spinner className="mt-5" animation="border" />
                </Container>
            :
                <Container>
                    {handleMsg()}
                    {
                        listsCalc === 0 ?
                            showSearch === "" && show === "0" ?
                                <>
                                    <p className="text-center">
                                        You don't have any lists. 
                                    </p>
                                    <p className="text-center">
                                        Create your first list by the input field on the header.
                                    </p>
                                </>
                            :
                                <>
                                    <p className="text-center">
                                        You don't have any lists with these conditions.
                                    </p>
                                </>
                        :
                            <Accordion style={{width: "80%"}} className="ms-auto me-auto">
                                {showLists.map(list => 
                                    <List 
                                        key={list.id}
                                        list={list}
                                        getLists={getLists}
                                    />    
                                )}
                            </Accordion>
                    }
                </Container>
            }
        </>
    );
};

export default Lists;
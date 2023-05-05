import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { StateContext } from "../../context/StateContext";
import Header from "../../layouts/header/Header";

const Settings = () => {
    const {token, setToken, err, setErr, succ, setSucc} = useContext(StateContext); 

    const [userdata, setUserdata] = useState({
        username: "",
        email: ""
    });
    const [change, setChange] = useState(0);
    const [passwords, setPasswords] = useState({
        old: "",
        new: "",
        reNew: ""
    });
    const [loading, setLoading] = useState(false);
    const [saveModal, setSaveModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if(!token){
            navigate("/");
        }
        else {
            setLoading(true);
            setErr("");
            //setSucc("");
            getUserdata().then(user => {
                setUserdata({
                    username: user.username,
                    email: user.email
                });
            });
            setLoading(false);
        }
    }, [token]);

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
    
    const getUserdata = async() => {
        const res = await fetch("http://localhost:5000/user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        })
        const data = await res.json();

        if(!data.success){
            setSucc("");
            return setErr(data.message);
        }
        setErr("");
        
        return {
            username: data.user.username,
            email: data.user.email
        };
    }

    const handleChange = async() => {
        setLoading(true);
        if(change === 0) {
            setErr("");
            setLoading(false);
            return setChange(1);
        }

        getUserdata().then(async(user) => {
            if(user.email === userdata.email && user.username === userdata.username){
                setLoading(false);
                setErr("");
                setSucc("Your username and e-mail are the same as were");
                return setChange(0);
            }
            if(user.email !== userdata.email){
                const res = await fetch("http://localhost:5000/user/update/email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        auth: token
                    },
                    body: JSON.stringify({
                        newemail: userdata.email
                    })
                });

                const data = await res.json();
                if(!data.success){
                    setLoading(false);
                    setSucc("");
                    return setErr(data.message);
                }
                setErr("");
                setSucc("You changed your userdata");
                setLoading(false);
                setChange(0);
            }
            if(user.username !== userdata.username){
                const res = await fetch("http://localhost:5000/user/update/username", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        auth: token
                    },
                    body: JSON.stringify({
                        newname: userdata.username
                    })
                });

                const data = await res.json();
                if(!data.success){
                    setLoading(false);
                    setSucc("");
                    setErr(data.message);
                    return setChange(0);;
                }
                setToken(data.token);
                setErr("");
                setSucc("You changed your userdata");
                setLoading(false);
                setChange(0);
            }
        });
    };

    const handleCancel = () => {
        getUserdata().then(user => {
            setUserdata({
                username: user.username,
                email: user.email
            });
            setChange(0);
            setPasswords({
                old: "",
                new: "",
                reNew: ""
            });
            setErr("");
        })
    };

    const handleChangePword = async() => {
        setLoading(true);
        if(change === 0){
            setErr("");
            setLoading(false);
            return setChange(2);
        }

        if(passwords.new !== passwords.reNew){
            setLoading(false);
            setSucc("");
            return setErr("The new passwords are not the same");
        }
        
        if(passwords.old === passwords.new){
            setLoading(false);
            setSucc("");
            return setErr("Your old and new passwords are the same");
        }

        const res = await fetch("http://localhost:5000/user/update/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                oldpword: passwords.old,
                newpword: passwords.new
            })
        });

        const data = await res.json();
        if(!data.success){
            setLoading(false);
            setSucc("");
            return setErr(data.message);
        }

        setChange(0);
        setPasswords({
            old: "",
            new: "",
            reNew: ""
        });

        setErr("");
        setSucc("You changed your password");
        setLoading(false);
    };

    const handleMsg = () => {
        if(err){
            return (
                <>
                    <Alert
                        style={{width: "100%"}}
                        className="text-center"
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
                        style={{width: "100%"}}
                        className="text-center"
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

    if(change === 0){
        return (
            <>
                <Header page="settings" />
                <Container className="d-flex justify-content-center">
                    <Card style={{width: "40rem"}}>
                        <Card.Header style={{fontWeight: 600}}>Manage Profile</Card.Header>
                        <Card.Body>
                            <Card.Text className="d-flex justify-content-between">
                                <span>Username:</span>
                                <span>{userdata.username}</span> 
                            </Card.Text>
                            <Card.Text className="d-flex justify-content-between">
                                <span>Email:</span>
                                <span>{userdata.email}</span> 
                            </Card.Text>
                            {handleMsg()}
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-evenly">
                            <Button onClick={handleChange}>Change username or email</Button>
                            <Button variant="warning" onClick={handleChangePword}>Change password</Button>
                        </Card.Footer>
                    </Card>
                </Container>
            </>
        );
    }
    else if(change === 1){
        return (
            <>
                <Header page="settings" />
                <Container className="d-flex justify-content-center">
                    <Modal
                        show={saveModal}
                        onHide={() => setSaveModal(false)}
                        backdrop="static"
                        keyboad={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Manage Profile</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Do you want to change userdata?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setSaveModal(false)}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={() => {
                                setSaveModal(false);
                                return handleChange();
                            }}>
                                Change
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Card style={{width: "40rem"}}>
                        <Card.Header style={{fontWeight: 600}}>Manage Profile</Card.Header>
                        <Card.Body>
                            <Card.Text className="d-flex justify-content-between">
                                <span>Username:</span>
                                <span>
                                    <Form.Control 
                                        type="text"
                                        size="sm"
                                        style={{width: "18vw"}}
                                        value={userdata.username}
                                        onChange={(e) => setUserdata({
                                            username: e.target.value,
                                            email: userdata.email
                                        })}
                                    />
                                </span> 
                            </Card.Text>
                            <Card.Text className="d-flex justify-content-between">
                                <span>Email:</span>
                                <span>
                                    <Form.Control 
                                        type="email"
                                        size="sm"
                                        style={{width: "18vw"}}
                                        value={userdata.email}
                                        onChange={(e) => setUserdata({
                                            username: userdata.username,
                                            email: e.target.value
                                        })}
                                    />
                                </span>  
                            </Card.Text>
                            {handleMsg()}
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between">
                            <Button
                                variant="danger"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => setSaveModal(true)}
                                disabled={loading}
                            >
                                {loading ?
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            className="me-1"
                                        />
                                        Save
                                    </>
                                :
                                    <>Save</>
                                }
                            </Button>
                        </Card.Footer>
                    </Card>
                </Container>
            </>
        );
    }
    else if(change === 2){
        return (
            <>
                <Header page="settings" />
                <Container className="d-flex justify-content-center">
                    <Card style={{width: "40rem"}}>
                        <Card.Header style={{fontWeight: 600}}>Manage Profile</Card.Header>
                        <Card.Body>
                            <Card.Text className="d-flex justify-content-between">
                                <span>Current password:</span>
                                <span>
                                    <Form.Control 
                                        type="password"
                                        size="sm"
                                        style={{width: "18vw"}}
                                        value={passwords.old}
                                        onChange={(e) => setPasswords({
                                            old: e.target.value,
                                            new: passwords.new,
                                            reNew: passwords.reNew
                                        })}
                                    />
                                </span> 
                            </Card.Text>
                            <Card.Text className="d-flex justify-content-between">
                                <span>New password:</span>
                                <span>
                                    <Form.Control 
                                        type="password"
                                        size="sm"
                                        style={{width: "18vw"}}
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({
                                            old: passwords.old,
                                            new: e.target.value,
                                            reNew: passwords.reNew
                                        })}
                                    />
                                </span>  
                            </Card.Text>
                            <Card.Text className="d-flex justify-content-between">
                                <span>Re-new password:</span>
                                <span>
                                    <Form.Control 
                                        type="password"
                                        size="sm"
                                        style={{width: "18vw"}}
                                        value={passwords.reNew}
                                        onChange={(e) => setPasswords({
                                            old: passwords.old,
                                            new: passwords.new,
                                            reNew: e.target.value
                                        })}
                                    />
                                </span>  
                            </Card.Text>
                            {handleMsg()}
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between">
                            <Button
                                variant="danger"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success"
                                onClick={handleChangePword}
                                disabled={loading}
                            >
                                {loading ?
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            className="me-1"
                                        />
                                        Save
                                    </>
                                :
                                    <>Save</>
                                }
                            </Button>
                        </Card.Footer>
                    </Card>
                </Container>
            </>
        );
    }
};

export default Settings;
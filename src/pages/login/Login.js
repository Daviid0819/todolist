import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button, Container, Alert, Spinner, Row, Col } from "react-bootstrap";
import { StateContext } from "../../context/StateContext";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const {setToken, err, setErr, setSucc, succ} = useContext(StateContext);

    const navigate = useNavigate();

    useEffect(() => {
        setErr("");
        setSucc("");
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setErr("");
        }, 10000);
        return () => clearTimeout(timer);
    }, [err]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSucc("");
        }, 10000);
        return () => clearTimeout(timer);
    }, [succ]);

    const handleLogin = async(e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("http://localhost:5000/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        if(!data.success){
            setLoading(false);
            return setErr(data.message);
        }

        setToken(data.token);
        navigate("/home");
    };

    const handleVerify = async() => {
        if(formData.username === ""){
            return setErr("Enter your username");
        }

        setLoading(true);
        const res = await fetch("http://localhost:5000/user/resend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: formData.username
            })
        });

        const data = await res.json();

        if(!data.success){
            setLoading(false);
            return setErr(data.message);
        }

        setSucc(data.message);
        setLoading(false);
    };

    const handleForgotPass = async() => {
        if(formData.username === ""){
            return setErr("Enter your username");
        }

        setLoading(true);
        const res = await fetch("http://localhost:5000/user/forgot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: formData.username
            })
        });

        const data = await res.json();

        if(!data.success){
            return setErr(data.message);
        }

        setSucc(data.message);
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

    return (
        <>
            <Container 
                className="d-flex align-items-center justify-content-center"
                style={{height: "70vh"}}
            >
                <Card className="w-100" style={{maxWidth: "400px"}}>
                    <Card.Body>
                        <h3 className="text-center mb-3">TodoList Login</h3>
                        <Form onSubmit={handleLogin}>
                            <Form.Group id="username" className="mb-2">
                                <Form.Control 
                                    type="text"
                                    placeholder="Username"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ username: e.target.value, password: formData.password})}
                                />
                            </Form.Group>
                            <Form.Group id="password"  className="mb-2">
                                <Form.Control 
                                    type="password"
                                    placeholder="Password"
                                    required 
                                    value={formData.password}
                                    onChange={(e) => setFormData({ username: formData.username, password: e.target.value})}
                                />
                            </Form.Group>
                            {handleMsg()}
                            <Button
                                className="w-100 mb-2"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ?
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            className="me-1"
                                        />
                                        Login
                                    </>
                                :
                                    <>Login</>
                                }
                            </Button>
                        </Form>
                        <Row>
                            <Col>
                                <Button
                                    className="mb-2 w-100"
                                    variant="secondary"
                                    onClick={handleForgotPass}
                                    disabled={loading}
                                >
                                    Forgot password
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    className="mb-2 w-100"
                                    variant="secondary"
                                    onClick={handleVerify}
                                    disabled={loading}
                                >
                                    Verify account
                                </Button>
                            </Col>
                        </Row>
                        <Button
                            className="w-100"
                            variant="warning"
                            onClick={() => navigate("/register")}
                            disabled={loading}
                        >
                            Create an account
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default Login;
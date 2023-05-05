import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import { StateContext } from "../../context/StateContext";

const Login = () => {
    const {err, setErr} = useContext(StateContext);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        rePassword: ""
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setErr("");
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setErr("");
        }, 10000);
        return () => clearTimeout(timer);
    }, [err]);

    const handleRegister = async(e) => {
        e.preventDefault();
        setLoading(true);

        if(formData.password !== formData.rePassword){
            setLoading(false);
            return setErr("Passwords are not the same");
        }

        const res = await fetch("http://localhost:5000/user/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if(!data.success) {
            setLoading(false);
            return setErr(data.message);
        }

        navigate("/");
        setErr("");
        alert("Register successful");
    };

    const handleErr = () => {
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
    };

    return (
        <>
            <Container 
                className="d-flex align-items-center justify-content-center"
                style={{height: "70vh"}}
            >
                <Card className="w-100" style={{maxWidth: "400px"}}>
                    <Card.Body>
                        <h3 className="text-center mb-3">TodoList Register</h3>
                        <Form onSubmit={handleRegister}>
                            <Form.Control 
                                type="text"
                                placeholder="Username"
                                className="mb-2"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ 
                                    username: e.target.value,
                                    email: formData.email,
                                    password: formData.password,
                                    rePassword: formData.rePassword
                                })}
                            />
                            <Form.Control 
                                type="email"
                                placeholder="Email"
                                className="mb-2"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({
                                    username: formData.username,
                                    email: e.target.value,
                                    password: formData.password,
                                    rePassword: formData.rePassword
                                })}
                            />
                            <Form.Control 
                                type="password"
                                placeholder="Password"
                                className="mb-2"
                                required 
                                value={formData.password}
                                onChange={(e) => setFormData({
                                    username: formData.username,
                                    email: formData.email,
                                    password: e.target.value,
                                    rePassword: formData.rePassword
                                })}
                            />
                            <Form.Control 
                                type="password"
                                placeholder="Re-Password"
                                className="mb-2"
                                required 
                                value={formData.rePassword}
                                onChange={(e) => setFormData({
                                    username: formData.username,
                                    email: formData.email,
                                    password: formData.password,
                                    rePassword: e.target.value
                                })}
                            />
                            {handleErr()}
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
                                        Register
                                    </>
                                :
                                    <>Register</>
                                }
                            </Button>
                        </Form>
                        <Button
                            className="w-100"
                            variant="warning"
                            onClick={() => navigate("/")}
                            disabled={loading}
                        >
                            Go to login page
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default Login;
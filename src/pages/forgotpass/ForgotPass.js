import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { StateContext } from "../../context/StateContext";

const ForgotPass = () => {
    const [validUrl, setValidUrl] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pass, setPass] = useState({
        new: "",
        renew: ""
    });

    const {err, setErr} = useContext(StateContext);

    const params = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);

        const verifyUrl = async() => {
            const res = await fetch(`http://localhost:5000/user/${params.id}/pass/${params.token}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            if(!data.success){
                return setValidUrl(false);
            }

            setValidUrl(true);
        };

        verifyUrl();
        setLoading(false);
    }, []);

    const handleSave = async() => {
        setLoading(true);

        if(pass.new !== pass.renew){
            setLoading(false);
            return setErr("The new passwords are not the same");
        }

        const res = await fetch("http://localhost:5000/user/forgot/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pass: pass.new,
                userid: params.id
            })
        });

        const data = await res.json();

        if(!data.success){
            setLoading(false);
            return setErr(data.message);
        }

        setLoading(false);
        alert("You changed your password successfully!");
        navigate("/");
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
    }

    return (
        <>
            <Container
                className="d-flex align-items-center justify-content-center"
                style={{height: "70vh"}}
            >
            {
                loading ?
                    <Spinner animation="border" />
                :
                    validUrl ?
                        <Card style={{width: "40rem"}}>
                            <Card.Body>
                                <h3 className="text-center mb-3">TodoList Forgot Password</h3>
                                <Card.Text className="d-flex justify-content-between">
                                    <span>New password:</span>
                                    <span>
                                        <Form.Control 
                                            type="password"
                                            size="sm"
                                            style={{width: "18vw"}}
                                            value={pass.new}
                                            onChange={(e) => setPass({
                                                new: e.target.value,
                                                renew: pass.renew
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
                                            value={pass.renew}
                                            onChange={(e) => setPass({
                                                new: pass.new,
                                                renew: e.target.value
                                            })}
                                        />
                                    </span>  
                                </Card.Text>
                                {handleMsg()}
                            </Card.Body>
                            <Card.Footer className="d-flex justify-content-between">
                                <Button
                                    variant="primary"
                                    disabled={loading}
                                    onClick={() => navigate("/")}
                                >
                                    Go to login
                                </Button>
                                <Button
                                    variant="success"
                                    disabled={loading}
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </Card.Footer>
                        </Card>
                    :
                        <Card className="w-100" style={{maxWidth: "400px"}}>
                            <Card.Body>
                                <h3 className="text-center mb-3">TodoList Forgot Password</h3>
                                <p className="text-center">Invalid link!</p>
                                <Button
                                    className="w-100"
                                    variant="primary"
                                    onClick={() => navigate("/")}
                                >
                                    Go to login
                                </Button>
                            </Card.Body>
                        </Card>
            }
            </Container>
        </>
    );
};

export default ForgotPass;
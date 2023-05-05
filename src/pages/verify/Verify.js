import { useEffect, useState } from "react";
import { Button, Card, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const Verify = () => {
    const [validUrl, setValidUrl] = useState(false);
    const [loading, setLoading] = useState(false);

    const params = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);

        const verifyUrl = async() => {
            const res = await fetch(`http://localhost:5000/user/${params.id}/verify/${params.token}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            if(data.success){
                setValidUrl(true);
            }
        };

        verifyUrl();
        setLoading(false);
    }, []);

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
                        <Card className="w-100" style={{maxWidth: "400px"}}>
                            <Card.Body>
                                <h3 className="text-center mb-3">TodoList Verify</h3>
                                <p className="text-center">You successfully verified your account!</p>
                                <Button
                                    className="w-100"
                                    variant="primary"
                                    onClick={() => navigate("/")}
                                >
                                    Go to login
                                </Button>
                            </Card.Body>
                        </Card>
                    :
                        <Card className="w-100" style={{maxWidth: "400px"}}>
                            <Card.Body>
                                <h3 className="text-center mb-3">TodoList Verify</h3>
                                <p className="text-center">Invalid verify link!</p>
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

export default Verify;
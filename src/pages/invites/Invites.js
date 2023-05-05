import { useState, useEffect, useContext, useMemo } from "react";
import { Container, Table, Alert, Spinner } from "react-bootstrap";
import Invite from "../../components/invite/Invite";
import Header from "../../layouts/header/Header";
import { StateContext } from "../../context/StateContext";
import { useNavigate } from "react-router-dom";

const Invites = () => {
    const [invs, setInvs] = useState([]);
    const [loading, setLoading] = useState(false);

    const {token, err, setErr, succ, setSucc} = useContext(StateContext);

    const navigate = useNavigate();

    const invsCount = useMemo(() => invs.length, [invs]);

    useEffect(() => {
        if(!token) {
            navigate("/");
        }
        else {
            setLoading(true);
            setErr("");
            setSucc("");
            getInvites();
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

    const getInvites = async() => {
        const res = await fetch("http://localhost:5000/user/invite", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                auth: token
            }
        });

        const data = await res.json();
        if(data.invites){
            setInvs(data.invites.map(invite => ({
                listid: invite.listid,
                from: invite.from,
                listname: invite.listname,
                admin: invite.admin
            })));
        }
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
            <Header page="settings" />
            {loading ?
                <Container className="d-flex justify-content-center">
                    <Spinner className="mt-5" animation="border" />
                </Container>
            :
                <Container>
                    {handleErr()}
                    {
                        invsCount === 0 ?
                            <>
                                <p className="text-center">
                                    You don't have any invites.
                                </p>
                            </>
                        :
                            <Table striped hover>
                                <thead>
                                    <tr>
                                        <th>From</th>
                                        <th>List name</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invs.map(inv => 
                                        <Invite 
                                            key={inv.listid}
                                            inv={inv}
                                            getInvites={getInvites}
                                            token={token}
                                        />
                                    )}
                                </tbody>
                            </Table>
                    }
                </Container>
            }
        </>
    );
};

export default Invites;
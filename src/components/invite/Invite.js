import { useContext } from "react";
import { Button } from "react-bootstrap";
import { StateContext } from "../../context/StateContext";

const Invite = ({inv, getInvites, token}) => {
    const {setErr, setSucc} = useContext(StateContext);

    const handleInvite = async(acc) => {
        const res = await fetch("http://localhost:5000/user/invite/terminate/"+inv.listid, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                auth: token
            },
            body: JSON.stringify({
                accept: acc
            })
        });

        const data = await res.json();
        if(!data.success){
            setSucc("");
            return setErr("This list doesn't exist");
        }

        setErr("");
        acc ? setSucc("You accepted the invite") : setSucc("You rejected the invite");
        getInvites();
    };

    return (
        <>
            <tr className="align-middle">
                <td className="ps-3">
                    {inv.from}
                </td>
                <td>
                    {inv.listname}
                </td>
                <td className="text-center">
                    <Button 
                        variant="success"
                        onClick={() => handleInvite(true)}
                    >
                        Accept
                    </Button>
                </td>
                <td className="text-center">
                    <Button 
                        variant="danger"
                        onClick={() => handleInvite(false)}
                    >
                        Reject
                    </Button>
                </td>
            </tr>
        </>
    );
};

export default Invite;
import { useState, createContext } from "react";

export const StateContext = createContext();

export const StateProvider = ({ children }) => {
    const [show, setShow] = useState("0");
    const [search, setSearch] = useState("");
    const [token, setToken] = useState("");
    const [succ, setSucc] = useState("");
    const [err, setErr] = useState("");

    const value = {
        show,
        setShow,
        search,
        setSearch,
        token,
        setToken,
        succ,
        setSucc,
        err,
        setErr
    };

    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    );
};
import TodoList from "./pages/todolist/TodoList";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Settings from "./pages/settings/Settings";
import Lists from "./pages/lists/Lists";
import Invites from "./pages/invites/Invites";
import Verify from "./pages/verify/Verify";
import ForgotPass from "./pages/forgotpass/ForgotPass";

import { StateProvider } from "./context/StateContext";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <>
      <StateProvider>
        <Router>
          <Routes>
            <Route path="/" element={<><Login/></>} />
            <Route path="/home" element={<><TodoList/></>} />
            <Route path="/register" element={<><Register/></>} />
            <Route path="/settings" element={<><Settings /></>} />
            <Route path="/lists" element={<><Lists /></>} />
            <Route path="/invites" element={<><Invites /></>} />
            <Route path="/user/:id/verify/:token" element={<><Verify /></>} />
            <Route path="/user/:id/pass/:token" element={<><ForgotPass /></>} />
          </Routes>
        </Router>
      </StateProvider>
    </>
  );
};

export default App;

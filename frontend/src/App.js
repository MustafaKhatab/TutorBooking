import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import Register from "./features/user/Register";
import Chat from "./features/chat/Chat";
import PersistLogin from "./features/auth/PersistLogin";
import RequireAuth from "./features/auth/RequireAuth";
import useTitle from "./hooks/useTitle";
import NotFound from "./components/NotFound";

function App() {
  useTitle("MustafaGPT");

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>
            <Route path="chat">
              <Route index element={<Chat />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

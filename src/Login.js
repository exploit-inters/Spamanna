import React, { useState, useEffect } from "react";
import ipc from "./ipc";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default function Login({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    function listener(_, e) {
      setLoggedIn(e.loggedIn);
    }
    ipc.on("loggedin", listener);
    ipc.send("checklogin");
    return () => ipc.removeListener("loggedin", listener);
  }, []);
  if (loggedIn) return children;
  return (<LoginForm />);
}

function LoginForm() {
  const [user, setUser] = useState(localStorage.getItem('messengerUser') || '');
  const [pass, setPass] = useState(localStorage.getItem('messengerPass') || '');
  function handleSubmit(e) {
    e.preventDefault();
    ipc.send('login', { user, pass });
    localStorage.setItem('messengerUser', user);
    localStorage.setItem('messengerPass', pass);
  }
  return (
    <form onSubmit={handleSubmit} className="container">
      <h1>Please sign in to Messenger</h1>
      <div className="row">
        <TextField label="Email Address" value={user} onChange={e => setUser(e.target.value)} autoFocus />
      </div>
      <div className="row">
        <TextField label="Password" value={pass} onChange={e => setPass(e.target.value)} type="password" />
      </div>
      <div className="row">
        <Button type="submit" variant="contained" color="primary">Sign In</Button>
      </div>
      <style jsx>{`
        .container { text-align: center; }
        .row { margin-bottom: 12px; }
      `}</style>
    </form>
  );
}
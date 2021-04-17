import React, { useRef } from "react";
import axios from "axios";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { json } from "express";

const LoginForm = () => {
  let emailInputRef = useRef();
  let passwordInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // send http reqeuest to server with email & password to check and validate on the server

    const loginResponse = await axios.post("/api/loginform",
      { email: emailInputRef.current.value },
      { password: passwordInputRef.current.value }
    );

    // store a response from the http request below in variable called response
    const user = loginResponse.data;


    // store userID in local storage
    localStorage.setItem("userId", JSON.stringify(user))
    const result = localStorage.getItem("userId")
    JSON.parse(result);

    //if user is loged in and exists in database, redirect to chatpage
    if (user.statusCode === 201) {
      // redirect to chatpage
      return (
        <Route path="/chat" component={ChatPage} />
      )
    }

    /**
     * if new user is registering send post request to database and insert email and password into table
     * when response comes back from databse store in variable and store in local storage
     * then redirect to login page
     */
    
     const registerResponse = await axios.post("/api/register",
     { email: emailInputRef.current.value },
     { password: passwordInputRef.current.value }
   );

   const registeredUser = response.data;

  };


  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          className="form-control"
          id="email"
          aria-describedby="email"
          placeholder="Email..."
          ref={emailInputRef}
        ></input>
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          placeholder="Password..."
          ref={passwordInputRef}
        ></input>
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default LoginForm;

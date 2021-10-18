import React, { useRef } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
  let firstNameRef = useRef();
  let lastNameRef = useRef();
  let emailInputRef = useRef();
  let passwordInputRef = useRef();
  let history = useHistory();

  /**
   * if new user is registering send post request to database and insert first, lastname, email and password into table
   * then redirect to login page
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      firstName: firstNameRef.current.value,
      lastName: lastNameRef.current.value,
      email: emailInputRef.current.value,
      password: passwordInputRef.current.value
    };

    // send http reqeuest to server with credentials below to insert into table
    await axios.post('/api/register', body);
    history.push('/');
  };

  return (
    <form className='container' onSubmit={handleSubmit}>
      <div className='form-group'>
        <label>First Name</label>
        <input
          required
          type='firsName'
          className='form-control'
          id='firsName'
          aria-describedby='firstName'
          placeholder='Firs Name...'
          ref={firstNameRef}
        ></input>
      </div>
      <div className='form-group'>
        <label>Last Name</label>
        <input
          required
          type='lastName'
          className='form-control'
          id='lastName'
          aria-describedby='lastName'
          placeholder='Last Name...'
          ref={lastNameRef}
        ></input>
      </div>
      <div className='form-group'>
        <label>Email Address</label>
        <input
          required
          type='email'
          className='form-control'
          id='email'
          aria-describedby='email'
          placeholder='Email...'
          ref={emailInputRef}
        ></input>
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input
          required
          type='password'
          className='form-control'
          id='password'
          placeholder='Password...'
          ref={passwordInputRef}
        ></input>
      </div>

      <button type='submit' className='btn btn-primary'>
        Submit
      </button>

      <p>
        Already have an account? <Link to='/'>LOGIN</Link>
      </p>
    </form>
  );
};

export default Register;

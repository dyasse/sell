import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider } from '../firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. Google Login
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Mreba bik b Google!");
    } catch (err) {
      console.error(err.message);
    }
  };

  // 2. Facebook Login
  const handleFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      alert("Mreba bik b Facebook!");
    } catch (err) {
      console.error(err.message);
    }
  };

  // 3. Email Login
  const handleEmail = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Login Page - Nour App</h2>
      
      {/* Email Form */}
      <form onSubmit={handleEmail}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login b Email</button>
      </form>

      <hr />

      {/* Social Buttons */}
      <button onClick={handleGoogle} style={{ background: '#db4437', color: 'white' }}>
        Login with Google
      </button>
      
      <button onClick={handleFacebook} style={{ background: '#4267B2', color: 'white', marginLeft: '10px' }}>
        Login with Facebook
      </button>
    </div>
  );
};

export default Login;

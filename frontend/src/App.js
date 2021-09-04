import React from 'react';
import './App.css';
import GoogleLogin from 'react-google-login';
import axios from './axios';

function App() {

  const responseSuccessGoogle = (response) => {
    console.log(response);
    axios({
      method: "POST",
      url: "/googlelogin",
      data: {tokenId: response.tokenId}
    }).then(response => {
      console.log("Google login success", response);
    })
  }

  const responseErrorGoogle = (response) => {

  }

  return (
    <div className="header">
      <h1>Login With GOOGLE</h1>
      <GoogleLogin
          clientId="383363631691-0qd1fq1s2ee1r0drnnkpa1649mser2fi.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={responseSuccessGoogle}
          onFailure={responseErrorGoogle}
          cookiePolicy={'single_host_origin'}
      />
    </div>
  );
}

export default App;

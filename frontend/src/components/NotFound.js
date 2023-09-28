import React from 'react';
import { Link } from 'react-router-dom'
const NotFound = () => {
  return (
    
    <div className="not-found-container">
    <img src={require('../img/ChatGPTLogo.png')} alt="ChatGPT Logo" className="not-found-logo" />
      <h1 className="not-found-header">404 Not Found</h1>
      <p className="not-found-text">The page you are looking for does not exist.</p>
      <Link className='link-home' to="/">Back to Home</Link>
    </div>
  );
};

export default NotFound;

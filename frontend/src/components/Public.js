import { Link } from 'react-router-dom'

const Public = () => {
    const content = (
        <section className="public">
            <div className="container">
            <img src={require('../img/ChatGPTLogo.png')} alt="ChatGPT Logo" className="logo" />
              <h1>Welcome to MustafaGPT</h1>
              <h1>Log in with your OpenAI account to continue</h1>
              <div className="Link-container">
              <Link to="/login">Log in</Link>
              <Link to="/register">Sign up</Link>
              </div>
            </div>
            </section>
          );
    return content
}
export default Public
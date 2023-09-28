import React, { useState, useEffect } from "react";
import { useAddNewUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import theme from '../theme';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const USER_REGEX = /^[a-zA-Z0-9_-]{4,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  useTitle('Registration');

  const [addNewUser, { isSuccess, isError, error }] = useAddNewUserMutation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
    setUsernameError('');
  }, [username]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
    setPasswordError('');
  }, [password]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
    setEmailError('');
  }, [email]);

  useEffect(() => {
    if (isSuccess) {
      setUsername('');
      setPassword('');
      setEmail('');
      navigate('/login');
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (isError) {
      if (error.data.message==="Duplicate username") {
        console.log("here");
        setUsernameError('Username already exists.');
      }
      if (error.data.message==="Duplicate email") {
        setEmailError('Email already exists.');
      }
    }
  }, [isError, error]);

  const onUsernameChanged = e => setUsername(e.target.value);
  const onPasswordChanged = e => setPassword(e.target.value);
  const onEmailChanged = e => setEmail(e.target.value);

  const onSaveUserClicked = async (e) => {
    e.preventDefault();

    if (validEmail && validUsername && validPassword) {
      await addNewUser({ username, password, email });
    }
    else {
      if (!validUsername) {
        setUsernameError('Please enter a valid username.');
      }
      if (!validPassword) {
        setPasswordError('Please enter a valid password.');
      }
      if (!validEmail) {
        setEmailError('Please enter a valid email address.');
      }
    }
  };


  return (
    <ThemeProvider theme={theme}>
    <div className="register">
      <img src={require('../../img/ChatGPTLogo.png')} alt="ChatGPT Logo" className="logo" />
      <form className="form" onSubmit={onSaveUserClicked}>
        <div className="form__title-row">
          <h2>Create your account</h2>
        </div>
        <div>
        <Tooltip 
        title="Enter a valid username (4-20 characters) with letters, numbers, underscores, and hyphens." 
        placement="right"
        open={usernameError!==''}>
          <TextField
            className={'form__input'}
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            value={username}
            onChange={onUsernameChanged}
            label="Username"
            variant="outlined"
            error={usernameError!==''}
            helperText={usernameError}
            InputLabelProps={{
              style: { color: 'white' } // Specify the desired color here
            }}
               />
          </Tooltip>
        </div>
        <div>
          <TextField
            className={'form__input'}
            id="email"
            name="email"
            type="text"
            autoComplete="off"
            value={email}
            onChange={onEmailChanged}
            label="Email"
            variant="outlined"
            error={emailError!==''}
            helperText={emailError}
            InputLabelProps={{
              style: { color: 'white' } // Specify the desired color here
            }}
             />
        </div>
        <Tooltip 
        title="Enter a valid password (4-12 characters) with letters, numbers, and special characters (!@#$%)."
        placement="right"
        open={passwordError!==''}
          >
        <TextField
          className={'form__input'}
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChanged}
          label="Password"
          variant="outlined"
          error={passwordError!==''}
          helperText={passwordError}
          InputLabelProps={{
            style: { color: 'white' } // Specify the desired color here
          }}
          InputProps={{
            endAdornment: (
              <Tooltip title={showPassword ? 'Hide password' : 'Show password'} placement="right">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
            )
          }}
             />
          </Tooltip>
        <div className="form__action-buttons">
          <button
            className="icon-button"
            title="Save"
            disabled={false}
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
    </ThemeProvider>
  );
};

export default Register;

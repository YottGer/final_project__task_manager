import React, { useReducer } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { Grid, Paper, Avatar, TextField, Button, Typography, CircularProgress } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUsername } from "../features/accessToken/accessTokenSlice";

let accessToken: string;

const Login: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();

    const { mutate, isLoading, isError, error } = useMutation((data: object) => {
        return axios.post("http://localhost:5000/login", data);
    }, {
        onSuccess: (data) => {
            accessToken = data?.data.accessToken;
            dispatch(setToken(accessToken));
            console.log(data?.data.username)
            dispatch(setUsername(data?.data.username))
            console.log("login token " + accessToken);
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = Object.fromEntries(fd.entries());

        mutate(data);
    }

    const username = useSelector((state: any) => state.username); // fix 'any'!!!!!!!!!!!!!!!
    const paperStyle = {padding: 20, height: '37.5vh', width: 280, margin: "20px auto"};

    return(
        <>
            <Paper elevation={10} style={paperStyle}>
                <Grid display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <Avatar><LockIcon /></Avatar>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h5">Login</Typography>
                        <TextField
                            name="username" 
                            label="Username" 
                            placeholder="Enter username" 
                            fullWidth 
                            required
                            style={{margin: "10px"}} />
                        <TextField
                            name="password"
                            label="Password" 
                            placeholder="Enter password" 
                            type="password" 
                            fullWidth 
                            required
                            style={{margin: "10px"}} />
                        <Grid display="flex" justifyContent="center">
                            <Button 
                            type="submit" 
                            color="primary" 
                            variant="contained"
                            >Login</Button>
                        </Grid>
                    </form>
                </Grid>
            </Paper>
            {isLoading && 
                <>
                    Logging in...
                    <br />
                    <CircularProgress />
                </>
            }
            {isError && error /* add a nice error page */}
        </>
    );
}

export default Login;

//TODO: send/store hashed passwords

/*
I don't understand - am I using redux-toolkit correctly?
how does redux help me?
In addition, I don't understand the authentication process - why do I need JWT?
I transfer the JWT instead of (username, hashed-password), but what's the difference?
Security? Is it more secure that sending hashed-password?
Interception? can't the JWT be intercepted either?
And about admin status - can't I store the "isAdmin" on client somehow?
It seems unneccessary to check isAdmin every single time.
*/

/*error: 
A non-serializable value was detected in an action, in the path: `register`. Value: ƒ register(key) {
    _pStore.dispatch({
      type: _constants__WEBPACK_IMPORTED_MODULE_0__.REGISTER,
      key: key
    });
  } 
*/

//So, I get the above error, and I don't understand what it means, but the token persists between refreshes!!!
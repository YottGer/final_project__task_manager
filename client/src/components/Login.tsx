import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setToken, setUsername, setIsAdmin } from "../features/accessToken/accessTokenSlice";
import useMutate from "../hooks/useMutate";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Grid, Paper, Avatar, TextField, Button, Typography, CircularProgress } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import ErrorComp from "./ErrorComp";

const Login: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const [showTryAgain, setShowTryAgain] = useState(false);

    const { mutate, isLoading, isError, error } = useMutate(axios.post, "http://localhost:5000/login", {
        onSuccess: (data: AxiosResponse) => {
            const { accessToken, username, isAdmin } = data?.data;
            dispatch(setToken(accessToken));
            dispatch(setUsername(username));
            dispatch(setIsAdmin(isAdmin));
        }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowTryAgain(true);
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = Object.fromEntries(fd.entries());
        mutate(data);
    }

    const paperStyle = {padding: 20, height: '42.5vh', width: 280, margin: "20px auto"};

    return(
        <>
            <Paper elevation={10} style={paperStyle}>
                <Grid display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <Avatar><LockIcon /></Avatar>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <Typography variant="h5">Login</Typography>
                        <TextField
                            name="username" 
                            label="Username" 
                            placeholder="Enter username" 
                            fullWidth 
                            required
                            style={{margin: "10px"}}
                            onChange={() => setShowTryAgain(false)} />
                        <TextField
                            name="password"
                            label="Password" 
                            placeholder="Enter password" 
                            type="password" 
                            fullWidth 
                            required
                            style={{margin: "10px"}}
                            onChange={() => setShowTryAgain(false)} />
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
            {isError ? 
            ((error instanceof AxiosError && error.response?.status === 401) ?
            (showTryAgain ? <>Username and password don't match! try again...</> : <></>)
            :
            <ErrorComp err={error} />
            )
            : <></>}
        </>
    );
}

export default Login;

/*
I always get the following error in the console:

A non-serializable value was detected in an action, in the path: `register`. Value: ƒ register(key) {
    _pStore.dispatch({
      type: _constants__WEBPACK_IMPORTED_MODULE_0__.REGISTER,
      key: key
    });
  }
...

I don't understand what it means, and it doesn't seem to affect the app.
*/
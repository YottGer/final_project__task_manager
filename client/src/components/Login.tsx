import React from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../features/accessToken/accessTokenSlice";

let accessToken: string;

const Login: React.FC = (): JSX.Element => {
    const accessToken1 = useSelector((state: any) => state.accessToken); // fix 'any'
    console.log(accessToken1);
    const dispatch = useDispatch();

    const { mutate, isLoading, isError, error } = useMutation((data: object) => {
        return axios.post("http://localhost:5000/login", data);
    }, {
        onSuccess: (data) => {
            accessToken = data?.data.accessToken;
            dispatch(setToken(accessToken));
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

    return(
        <>
            <form onSubmit={handleSubmit}>
                <TextField label="username" name="username" />
                <TextField label="password" name="password" type="password" />
                <Button type="submit">submit</Button>
            </form>
            {isLoading && <div>Submitting form...</div>}
            {isError && <div>An error has occured...</div> /*TODO: Specify error*/ }
            <Button onClick={async () => {
                const response = await axios.post("http://localhost:5000/test_auth", "", {
                headers: {
                    Authorization: "Bearer " + accessToken
                }});
                console.log(response.data)
            }}>test auth</Button>
        </>
    );
}

export default Login;

//TODO: send/store hashed passwords

/*
I don't understand - am I using redux-toolkit correctly?
I thought the accessToken wouldn't reset after refresh/re-render, but it clearly does!
So I see I need to use localStorage, but then how does redux help me?
In addition, I don't understand the authentication process - why do I need JWT?
I transfer the JWT instead of (username, hashed-password), but what's the difference?
Security? Is it more secure that sending hashed-password?
Interception? can't the JWT be intercepted either?
And about admin status - can't I store the "isAdmin" on client somehow?
It seems unneccessary to check isAdmin every single time.
*/
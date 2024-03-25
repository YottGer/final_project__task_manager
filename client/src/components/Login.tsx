import React from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { TextField, Button } from "@mui/material";

const Login: React.FC = (): JSX.Element => {
    const { mutate, isLoading, isError, error } = useMutation((data: object) => {
        return axios.post("http://localhost:5000/login", data);
    }, {
        onSuccess: (data) => {
            const accessToken = data?.data.accessToken;
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
            {isError && <div>An error has occured while trying to submit the form...</div> /*TODO: Specify error*/ }
        </>
    );
}

export default Login;

//TODO: send/store hashed passwords
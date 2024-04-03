import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUsername } from "../../features/accessToken/accessTokenSlice";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { List, Button, CircularProgress, Typography } from "@mui/material";
import Project from "../Project";
import Login from "../Login";

export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

interface IAccessTokenState {
    accessToken: {
        token: string,
        username: string
    }
}

const HomePage: React.FC = (): JSX.Element => {
    const { token, username } = useSelector((state: IAccessTokenState) => state.accessToken);
    const isLoggedIn = token !== "";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = () => {
        dispatch(setToken(""));
        dispatch(setUsername(""));
        navigate("/"); // refresh page
    }

    const { data, isLoading, isFetching, isError, error } = useQuery("fetch-projects", () => {
        return axios.get("http://localhost:5000/projects", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
    });

    return (
        <>
            {isLoggedIn || <Login />}
            {
            isLoggedIn && 
            <>
                <Typography variant="h6">welcome {username}!</Typography>
                <Button onClick={logout}>Logout</Button>
                <Typography variant="h5">Your projects:</Typography>    
                <List>
                {data?.data.map(({ id, title, description, status }: IProject) =>
                <Project
                    key={"project" + id}
                    id={id}
                    title={title}
                    description={description}
                    status={status}
                />)}
                </List>
                {(isLoading || isFetching) && 
                    <>
                        Fetching projects
                        <br />
                        <CircularProgress />
                    </>
                }
                {isError && error /* add a nice error page */}
                <Button onClick={() => navigate("/create_project")} variant="contained">Create Project</Button>
            </>
            }
        </>
    );
}

export default HomePage;
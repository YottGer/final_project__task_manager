import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUsername, setIsAdmin } from "../../features/accessToken/accessTokenSlice";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { List, Button, CircularProgress, Typography } from "@mui/material";
import Project from "../Project";
import Login from "../Login";
import ErrorComp from "../ErrorComp";

export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

export interface IAccessTokenState {
    accessToken: {
        token: string,
        username: string,
        isAdmin: boolean
    }
}

const HomePage: React.FC = (): JSX.Element => {
    const { token, username, isAdmin } = useSelector((state: IAccessTokenState) => state.accessToken);
    const isLoggedIn = token !== "";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = () => {
        dispatch(setToken(""));
        dispatch(setUsername(""));
        dispatch(setIsAdmin(false));
        navigate("/"); // refresh page
    }

    const { data, isLoading, isFetching, isError, error } = useFetch("fetchProjects", "http://localhost:5000/projects", {
        enabled: isLoggedIn
    });

    return (
        <>
            {
            isLoggedIn ?
            (isError ? 
            <ErrorComp err={error} />
            :
            <>
                <Typography variant="h6">welcome {username}! You are {isAdmin ? "" : "not"} an admin!</Typography>
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
                {isAdmin && 
                 <Button onClick={() => navigate("/create_project")} variant="contained">Create Project</Button>}
            </>
            )
            :
            <Login />
            }
        </>
    );
}

export default HomePage;
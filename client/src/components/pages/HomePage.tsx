import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUsername, setIsAdmin } from "../../features/accessToken/accessTokenSlice";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import ErrorComp from "../ErrorComp";
import { Button, Typography, List } from "@mui/material";
import Project from "../Project";
import Loading from "../Loading";

export interface IAccessTokenState {
    accessToken: {
        token: string,
        username: string,
        isAdmin: boolean
    }
}

export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

const HomePage: React.FC = (): JSX.Element => {
    const { isAdmin } = useSelector((state: IAccessTokenState) => state.accessToken);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = () => {
        dispatch(setToken(""));
        dispatch(setUsername(""));
        dispatch(setIsAdmin(false));
        navigate("/");
    }

    const { data, isLoading, isFetching, isError, error } = useFetch("fetchProjects", "http://localhost:5000/projects");

    if (isError)
        return <ErrorComp err={error} />;

    return (
        <>
            <Button onClick={logout} variant="contained">Logout</Button>
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
            <Loading enabled={isLoading || isFetching} msg="Fetching projects..." />
            <Button href="/create_project" variant="contained" disabled={!isAdmin}>Create Project</Button>
        </>
    );
}

export default HomePage;
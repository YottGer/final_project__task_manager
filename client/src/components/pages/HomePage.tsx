import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Project from "../Project";
import Login from "../Login";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUsername } from "../../features/accessToken/accessTokenSlice";
import { List, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";


export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

const HomePage: React.FC = (): JSX.Element => {
    const { token, username } = useSelector((state: any) => state.accessToken); // any is required (?)
    const isLoggedIn = token !== "";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    console.log(isLoggedIn, token);

    const logout = () => {
        dispatch(setToken(""));
        dispatch(setUsername(""));
        navigate("/");
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
            {!isLoggedIn && <Login />}
            {
            isLoggedIn && 
            <>
                <Typography variant="h6">welcome {username}!</Typography>
                <Button onClick={logout}>Logout</Button>    
                <List>
                {data?.data.map((project: IProject) =>
                <Project
                    key={"project" + project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    status={project.status}
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
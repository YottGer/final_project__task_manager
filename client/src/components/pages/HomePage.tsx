import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Project from "../Project";
import Login from "../Login";
import { useSelector } from "react-redux";

export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

const HomePage: React.FC = (): JSX.Element => {
    const accessToken = useSelector((state: any) => state.accessToken); // fix 'any'!!!!!!!!!!!!!!!1
    console.log("home page token ", accessToken);

    const { data, isLoading, isError, error } = useQuery("fetch-projects", () => {
        return axios.get("http://localhost:5000/projects", {
            headers: {
                Authorization: "Bearer " + accessToken.token
            }
        });
    })

    return (
        <>
            <Login />
            <div style={{display: "flex", flexFlow: "row", justifyContent: "space-around"}}>
            {data?.data.map((project: IProject) => <Project
            key={"project" + project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            status={project.status} />)}
            </div>
            {isLoading && <div>Loading...</div> /* Add a nicer spiner */}
            {isError && <div>An error has occured...</div> /*TODO: Specify error*/ }
        </>
    );
}

export default HomePage;
import React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Project from "../Project";

export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

const HomePage: React.FC = (): JSX.Element => {
    const { data, isLoading, isError, error } = useQuery("fetch-projects", () => {
        return axios.get("http://localhost:5000/projects");
    })

    console.log(isError);

    return (
        <>
            <div style={{display: "flex", flexFlow: "row", justifyContent: "space-around"}}>
            {data?.data.map((project: IProject) => <Project
            key={"project" + project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            status={project.status} />)}
            </div>
            {isLoading && <div>Loading...</div> /* Add a nicer spiner */}
            {isError && <div>An error has occured while trying to submit the form...</div> /*TODO: Specify error*/ }
        </>
    );
}

export default HomePage;
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Project from "../Project";

export interface IProject {
    id: number
    title: string,
    description: string,
    status: string
}

const HomePage: React.FC = (): JSX.Element => {
    const [projects, setProjects] = useState(Array<IProject>());

    useEffect(() => {
        axios.get("http://localhost:5000/projects").then((res) => setProjects(res.data));
    }, [setProjects]);

    return (
        <div style={{display: "flex", flexFlow: "row", justifyContent: "space-around"}}>
        {projects.map((project: IProject) => <Project
         key={"project" + project.id}
         id={project.id}
         title={project.title}
         description={project.description}
         status={project.status} />)}
        </div>
    );
}

export default HomePage;
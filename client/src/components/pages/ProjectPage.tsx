import React from "react";
import CreateTask from "../CreateTask";
import { useQuery } from "react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import Task from "../Task";

export interface ITask {
    id: number,
    projectId: number,
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    tags: string[]
}

const ProjectPage: React.FC = (): JSX.Element => {
    const projectId = useParams().project_id;

    const { data, isLoading, isError, error } = useQuery("fetch-tasks" + projectId, () => {
        return axios.get(`http://localhost:5000/project/${projectId}/tasks`);
    })

    return (
        <>
        <div style={{display: "flex", flexFlow: "row", justifyContent: "space-around"}}>
            {data?.data.map((task: ITask) => <Task
            key={"task" + task.id}
            id={task.id}
            projectId={task.projectId}
            title={task.title}
            description={task.description}
            startDate={task.startDate}
            endDate={task.endDate}
            tags={task.tags}
            />)}
            </div>
        {isLoading && <div>Loading...</div> /* Add a nicer spiner */}
        {isError && <div>An error has occured</div> /*TODO: Specify error*/ }
        <CreateTask />
        </>
    );
}

export default ProjectPage;

//TODO: Handle code multiplication (see home page) - export fetching to an external hook
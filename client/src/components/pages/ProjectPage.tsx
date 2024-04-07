import React from "react";
import CreateTask from "../CreateTask";
import { useQuery } from "react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import Task from "../Task";
import UpdateProject from "../UpdateProject";
import { Typography, List, ListItem, CircularProgress } from "@mui/material";
import useFetch from "../../hooks/useFetch";
import { useSelector } from "react-redux";
import { IAccessTokenState } from "./HomePage";

export interface ITask {
    id: number,
    projectId: number,
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    tags: string[],
    status: string
}

const ProjectPage: React.FC = (): JSX.Element => {
    const { isAdmin } = useSelector((state: IAccessTokenState) => state.accessToken);
    const projectId = useParams().project_id;

    const { 
        data: detailsData,
        isLoading: detailsLoading, 
        isFetching: detailsFetching, 
        isError: detailsIsError, 
        error: detailsError
    } = useFetch("fetchProjectDetails" + projectId, `http://localhost:5000/project/${projectId}`);

    const {
        data: tasksData, 
        isLoading: tasksLoading, 
        isFetching: tasksFetching, 
        isError: tasksIsError, 
        error: tasksError 
    } = useFetch("fetchTasksForProject" + projectId, `http://localhost:5000/project/${projectId}/tasks`);

    return (
        <>
            {(detailsLoading || detailsFetching) && 
                <>
                    Fetching project details
                    <br />
                    <CircularProgress />
                </>
            }
            {detailsIsError && detailsError /* add a nice error page */}
            <Typography variant="h4">Title: {detailsData?.data.title}</Typography>
            <Typography variant="h5">description: {detailsData?.data.description}</Typography>
            <Typography variant="body1">status: {detailsData?.data.status}</Typography>
            <Typography variant="body1">
                team: 
                <List>
                    {detailsData?.data.team.map((username: string, index: number) =>
                    <ListItem key={`project ${projectId} member ${index}`}>{username}</ListItem>
                    )}
                </List>
            </Typography>
            <Typography variant="h6">Tasks:</Typography>
            <div style={{display: "flex", flexDirection: "row"}}>
                <List>
                    {tasksData?.data.filter((task: ITask) => task.status !== "done" ).map((task: ITask) =>
                    <Task
                        key={`project ${projectId} task ${task.id}`}
                        id={task.id}
                        projectId={task.projectId}
                        title={task.title}
                        description={task.description}
                        startDate={task.startDate}
                        endDate={task.endDate}
                        tags={task.tags}
                        status={task.status}
                    />)}
                </List>
                <List>
                    {tasksData?.data.filter((task: ITask) => task.status === "done" ).map((task: ITask) =>
                    <Task
                        key={`project ${projectId} task ${task.id}`}
                        id={task.id}
                        projectId={task.projectId}
                        title={task.title}
                        description={task.description}
                        startDate={task.startDate}
                        endDate={task.endDate}
                        tags={task.tags}
                        status={task.status}
                    />)}
                </List>
            </div>
            {(tasksLoading || tasksFetching) && 
                <>
                    Fetching project details
                    <br />
                    <CircularProgress />
                </>
            }
            {tasksIsError && tasksError /* add a nice error page */}
            <CreateTask team={detailsData?.data.team} />
            {isAdmin && <UpdateProject />}
        </>
    );
}

export default ProjectPage;

//TODO: Handle code multiplication (see home page) - export fetching to an external hook
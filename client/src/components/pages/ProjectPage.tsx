import React from "react";
import { useSelector } from "react-redux";
import { IAccessTokenState } from "./HomePage";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import ErrorComp from "../ErrorComp";
import { Typography, List, ListItem } from "@mui/material";
import Loading from "../Loading";
import Task from "../Task";
import CreateTask from "../CreateTask";
import UpdateProject from "../UpdateProject";

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

    if (detailsIsError)
        return <ErrorComp err={detailsError} />;
    
    if (tasksIsError)
        return <ErrorComp err={tasksError} />;

    return (
        <>
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
            <Loading enabled={detailsLoading || detailsFetching} msg="Fetching project details" />
            <Typography variant="h6">Tasks:</Typography>
            <div style={{display: "flex", flexDirection: "row"}}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <Typography variant="body1">In the works:</Typography>
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
                </div>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <Typography variant="body1">Done:</Typography>
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
            </div>
            <Loading enabled={tasksLoading || tasksFetching} msg="Fetching tasks" />
            <CreateTask />
            <UpdateProject disabled={!isAdmin} />
        </>
    );
}

export default ProjectPage;
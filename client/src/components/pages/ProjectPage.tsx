import React, { useState } from "react";
import CreateTask from "../CreateTask";
import { useQuery } from "react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import Task from "../Task";
import UpdateProject from "../UpdateProject";
import { Typography, List, ListItem, CircularProgress } from "@mui/material";

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
    const projectId = useParams().project_id;

    const { data: detailsData, isLoading: detailsLoading, isFetching: detailsFetching, isError: detailsIsError, error: detailsError } =
     useQuery("fetch-details" + projectId, () => {
        return axios.get(`http://localhost:5000/project/${projectId}`);
    })

    const { data, isLoading, isFetching, isError, error } = useQuery("fetch-tasks" + projectId, () => {
        return axios.get(`http://localhost:5000/project/${projectId}/tasks`);
    })

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
                    {detailsData?.data.team.map((teamMember: any) =>
                    <ListItem>{teamMember.username}</ListItem>
                    )}
                </List>
            </Typography> {/*fix any!!!*/}
            <Typography variant="h6">Tasks:</Typography>
            <List>
                {data?.data.map((task: ITask) =>
                <Task
                    key={"task" + task.id}
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
            {(isLoading || isFetching) && 
                <>
                    Fetching project details
                    <br />
                    <CircularProgress />
                </>
            }
            {isError && error /* add a nice error page */}
            <CreateTask />
            <UpdateProject />
        </>
    );
}

export default ProjectPage;

//TODO: Handle code multiplication (see home page) - export fetching to an external hook
import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { Typography, Chip } from "@mui/material";
import { useParams } from "react-router-dom";
import CreateComment from "../CreateComment";
import Comment from "../Comment";

export interface IComment {
    id: number,
    taskId: number,
    title: string,
    content: string
}

const TaskPage: React.FC = (): JSX.Element => {
    const taskId = useParams().task_id;

    const { data: detailsData, isLoading: detailsLoading, isError: detailsIsError, error: detailsError } =
     useQuery("fetch-details" + taskId, () => {
        return axios.get(`http://localhost:5000/task/${taskId}`);
    })

    const { data: commentsData, isLoading: commentsIsLoading, isError: commentsIsError, error: commentsError } =
     useQuery("fetch-comments" + taskId, () => {
        return axios.get(`http://localhost:5000/task/${taskId}/comments`);
    })

    return (
        <>
        <Typography variant="h2">Task details:</Typography>
        {detailsLoading && <div>Loading details...</div> /* Add a nicer spiner */}
        {detailsIsError && <div>An error has occured</div> /*TODO: Specify error*/ }
        <Typography variant="body1">title: {detailsData?.data[0].title}</Typography>
        <Typography variant="body1">description: {detailsData?.data[0].description}</Typography>
        <Typography variant="body1">start date: {detailsData?.data[0].startDate}</Typography>
        <Typography variant="body1">end date: {detailsData?.data[0].endDate}</Typography>
        <Typography variant="body1">start date: {detailsData?.data[0].tags?.map((tagStr: string) => <Chip color="info" label={tagStr} />)}</Typography>
        <Typography variant="h2">Comments:</Typography>
        {commentsIsLoading && <div>Loading comments...</div> /* Add a nicer spiner */}
        {commentsIsError && <div>An error has occured</div> /*TODO: Specify error*/ }
        {commentsData?.data.map((comment: IComment) => <Comment {...comment} />)}
        <CreateComment />
        </>
    );
}

export default TaskPage;
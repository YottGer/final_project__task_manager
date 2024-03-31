import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { Typography, Chip, List, ListItem, CircularProgress } from "@mui/material";
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

    const { data: detailsData, isLoading: detailsLoading, isFetching: detailsFetching,
         isError: detailsIsError, error: detailsError } =
     useQuery("fetch-details" + taskId, () => {
        return axios.get(`http://localhost:5000/task/${taskId}`);
    })

    const { data: commentsData, isLoading: commentsIsLoading, isFetching: commentsIsFetching,
         isError: commentsIsError, error: commentsError } =
     useQuery("fetch-comments" + taskId, () => {
        return axios.get(`http://localhost:5000/task/${taskId}/comments`);
    })

    return (
        <>
        <Typography variant="h4">Task details:</Typography>
        {(detailsLoading || detailsFetching) && 
                <>
                    Fetching task details
                    <br />
                    <CircularProgress />
                </>
        }
        {detailsIsError && detailsError /* add a nice error page */}
        <Typography variant="h5">title: {detailsData?.data.title}</Typography>
        <Typography variant="body1">description: {detailsData?.data.description}</Typography>
        <Typography variant="body2">start date: {detailsData?.data.startDate}</Typography>
        <Typography variant="body2">end date: {detailsData?.data.endDate}</Typography>
        <Typography variant="body2">tags: {detailsData?.data.tags?.map((tagStr: string) => <Chip color="info" label={tagStr} />)}</Typography>
        <Typography variant="body2">
            links:
            <List>
                {detailsData?.data.links?.map((linkStr: string) =>
                 <ListItem><a href={linkStr}>{linkStr}</a></ListItem>
                )}
            </List>
        </Typography>
        <Typography variant="body2">
            leaders:
            <List>
                {detailsData?.data.leaders?.map((leader: any) => 
                 <ListItem>{leader.username}</ListItem>
                )}
            </List>
        </Typography>
        {/* fix any!!!!!!!!!!!!!!!!!!! */}
        <Typography variant="h4">Comments:</Typography>
        {(commentsIsLoading || commentsIsFetching) && 
                <>
                    Fetching comments
                    <br />
                    <CircularProgress />
                </>
        }
        {commentsIsError && commentsError /* add a nice error page */}
        <List>
            {commentsData?.data.map((comment: IComment) =>
            <Comment {...comment} />)}
        </List>
        <CreateComment />
        </>
    );
}

export default TaskPage;
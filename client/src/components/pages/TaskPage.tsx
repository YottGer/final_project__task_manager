import React from "react";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import ErrorComp from "../ErrorComp";
import { Typography, Chip, List, ListItem, CircularProgress } from "@mui/material";
import Comment from "../Comment";
import CreateComment from "../CreateComment";
import UpdateTask from "../UpdateTask";

export interface IComment {
    id: number,
    taskId: number,
    title: string,
    content: string
}

const TaskPage: React.FC = (): JSX.Element => {
    const projectId = useParams().project_id;
    const taskId = useParams().task_id;

    const {
        data: detailsData, 
        isLoading: detailsLoading, 
        isFetching: detailsFetching,
        isError: detailsIsError, 
        error: detailsError
    } = useFetch(
        `project ${projectId} task ${taskId} fetch details`,
        `http://localhost:5000/project/${projectId}/task/${taskId}`
    );

    const {
        data: commentsData, 
        isLoading: commentsIsLoading, 
        isFetching: commentsIsFetching,
        isError: commentsIsError, 
        error: commentsError 
    } = useFetch(
        `project ${projectId} task ${taskId} fetch comments`,
        `http://localhost:5000/project/${projectId}/task/${taskId}/comments`
    );

    if (detailsIsError)
        return <ErrorComp err={detailsError} />;
    
    if (commentsIsError)
        return <ErrorComp err={commentsError} />;

    return (
        <>
        <Typography variant="h4">Task details:</Typography>
        {(detailsLoading || detailsFetching) ? 
        <>
            Fetching task details
            <br />
            <CircularProgress />
        </>
        :
        <></>
        }
        <Typography variant="h5">title: {detailsData?.data.title}</Typography>
        <Typography variant="body1">description: {detailsData?.data.description}</Typography>
        <Typography variant="body2">start date: {detailsData?.data.startDate}</Typography>
        <Typography variant="body2">end date: {detailsData?.data.endDate}</Typography>
        <Typography variant="body2">
            tags: {detailsData?.data.tags?.map((tagStr: string, index: number) =>
             <Chip key={`Tag ${index} for task ${taskId} in TaskPage`} color="info" label={tagStr} />)}
        </Typography>
        <Typography variant="body2">
            links:
            <List>
                {detailsData?.data.links?.map((linkStr: string, index: number) =>
                 <ListItem key={`project ${projectId} task ${taskId} link ${index}`}><a href={linkStr}>{linkStr}</a></ListItem>
                )}
            </List>
        </Typography>
        <Typography variant="body2">
            leaders:
            <List>
                {detailsData?.data.leaders?.map((username: string, index: number) => 
                 <ListItem key={`project ${projectId} task ${taskId} leader ${index}`}>{username}</ListItem>
                )}
            </List>
        </Typography>
        <Typography variant="body2">
            status: {detailsData?.data.status}
        </Typography>
        <Typography variant="h4">Comments:</Typography>
        {(commentsIsLoading || commentsIsFetching) ? 
        <>
            Fetching comments
            <br />
            <CircularProgress />
        </>
        :
        <></>
        }
        <List>
            {commentsData?.data.map((comment: IComment, index: number) =>
             <Comment key={`Task ${taskId} comment ${index}`} {...comment} />)}
        </List>
        <CreateComment />
        <UpdateTask />
        </>
    );
}

export default TaskPage;
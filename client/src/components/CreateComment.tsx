import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import useMutate from "../hooks/useMutate";
import axios from "axios";
import { TextField, Button, Dialog, CircularProgress } from "@mui/material";
import ErrorComp from "./ErrorComp";

const CreateComment: React.FC = (): JSX.Element => {
    const [open, setOpen] = useState(false);

    const projectId = useParams().project_id;
    const taskId = useParams().task_id;

    const queryClient = useQueryClient();

    const { mutate, isLoading, isError, error } = useMutate(axios.post, "http://localhost:5000/create_comment", {
        onSuccess: () => {
            queryClient.invalidateQueries(`project ${projectId} task ${taskId} fetch comments`);
            setOpen(false);
        }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), taskId};
        mutate(data);
    }

    return (
    <>
        <Button onClick={() => setOpen(true)}>Create a new comment</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            {isError ?
            <ErrorComp err={error} />
            :
            <>
                <form onSubmit={handleSubmit} autoComplete="off" style={{
                    display: "flex",
                    flexDirection: "column",   
                }}>
                    <TextField label="title" name="title" margin="normal" required />
                    <TextField label="content" name="content" margin="normal" required />
                    <Button type="submit">submit</Button>
                </form>
                <>
                {isLoading ? 
                <>
                    Creating comment...
                    <br />
                    <CircularProgress />
                </>
                :
                <></>
                }
                </>
            </>
            }
        </Dialog>
    </>
    );
}

export default CreateComment;
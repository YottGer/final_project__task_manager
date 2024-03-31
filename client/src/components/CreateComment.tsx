import React, { useState } from "react";
import { TextField, Button, Dialog, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { useQueryClient, useMutation } from "react-query";
import axios from "axios";

const CreateComment: React.FC = (): JSX.Element => {
    const taskId = parseInt(useParams().task_id ?? '-1'); // id can't be negative

    const queryClient = useQueryClient();
    const {mutate, isLoading, isError, error } = useMutation((data: object) => {
        return axios.post("http://localhost:5000/create_comment", data);
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('fetch-comments' + taskId);
            setOpen(false);
        }
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), taskId};

        mutate(data);
    }

    const [open, setOpen] = useState(false);

    return (
    <>
        <Button onClick={() => setOpen(true)}>Create a new comment</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <form onSubmit={handleSubmit} style={{
                display: "flex",
                flexDirection: "column",   
            }}>
                <TextField label="title" name="title" margin="normal" />
                <TextField label="content" name="content" margin="normal" />
                <Button type="submit">submit</Button>
            </form>
            <>
            {isLoading && 
                <>
                    Creating comment...
                    <br />
                    <CircularProgress />
                </>
            }
            {isError && error /* add a nice error page */}
            </>
        </Dialog>
    </>
    );
}

export default CreateComment;

//TODO: handle code multiplication (see CreateTask/CreateProject)
//TODO: reset form after succsess (onSuccess)
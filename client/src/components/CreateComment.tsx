import React from "react";
import { TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { useQueryClient, useMutation } from "react-query";
import axios from "axios";

const CreateComment: React.FC = (): JSX.Element => {
    const taskId = parseInt(useParams().task_id ?? '-1'); // id can't be negative

    const queryClient = useQueryClient();
    const {mutate, isLoading, isError, error} = useMutation((data: object) => {
        return axios.post("http://localhost:5000/create_comment", data);
    }, {
        onSuccess: () => {queryClient.invalidateQueries('fetch-comments' + taskId);}
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), taskId};

        mutate(data);
    }

    return (
    <>
        <form onSubmit={handleSubmit} style={{
            display: "flex",
            flexDirection: "column",   
        }}>
            <TextField label="title" name="title" />
            <TextField label="content" name="content" />
            <Button type="submit">submit</Button>
        </form>
        {isLoading && <div>Submitting form...</div>}
        {isError && <div>An error has occured while trying to submit the form...</div> /*TODO: Specify error*/ }
    </>
    );
}

export default CreateComment;

//TODO: handle code multiplication (see CreateTask/CreateProject)
//TODO: reset form after succsess (onSuccess)
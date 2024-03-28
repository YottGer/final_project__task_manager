import React from "react";
import { TextField, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { useQueryClient, useMutation } from "react-query";
import axios from "axios";
import { useParams } from "react-router-dom";

const UpdateProject: React.FC = (): JSX.Element => {
    const accessToken = useSelector((state: any) => state.accessToken); // fix 'any'!!!!!!!!!!!!!!!
    const projectId = parseInt(useParams().project_id ?? '-1'); // id can't be negative

    const queryClient = useQueryClient();
    const {mutate, isLoading, isError, error} = useMutation((data: object) => {
        return axios.patch(`http://localhost:5000/${projectId}/update_project_title`, data);
    }, {
        onSuccess: () => {queryClient.invalidateQueries('fetch-details' + projectId);}
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = Object.fromEntries(fd.entries());

        mutate(data);
    }

    return(
        <>
        <form onSubmit={handleSubmit}>
            <TextField name="title" label="Update project title" />
            <Button type="submit">update</Button>
        </form>
        {isLoading && <div>Submitting update...</div>}
        {isError && <div>An error has occured...</div> /*TODO: Specify error*/ }
        </>
    );
}

export default UpdateProject;
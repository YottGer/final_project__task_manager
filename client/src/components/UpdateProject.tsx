import React, { useState } from "react";
import { TextField, Button, Dialog, Box, CircularProgress } from "@mui/material";
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
        onSuccess: () => {
            queryClient.invalidateQueries('fetch-details' + projectId);
            setOpen(false);
        }
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = Object.fromEntries(fd.entries());

        mutate(data);
    }

    const [open, setOpen] = useState(false);

    return(
        <>
        <Button onClick={() => setOpen(true)} variant="contained">Update project</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <>
            <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column">
                    <TextField name="title" label="Update project title" margin="normal" />
                    <Button type="submit">update</Button>
                </Box>
            </form>
            {isLoading && 
                <>
                    Submitting update...
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

export default UpdateProject;
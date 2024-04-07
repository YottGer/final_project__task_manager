import React, { useState } from "react";
import { TextField, Button, Dialog, Autocomplete, FormLabel, RadioGroup, CircularProgress, FormControlLabel,
Radio, 
Typography} from "@mui/material";
import { useSelector } from "react-redux";
import { useQueryClient, useMutation, useQuery } from "react-query";
import useMutate from "../hooks/useMutate";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProject: React.FC = (): JSX.Element => {
    const { token } = useSelector((state: any) => state.accessToken); // fix 'any'!!!!!!!!!!!!!!!
    const projectId = parseInt(useParams().project_id ?? '-1'); // id can't be negative
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { mutate, isLoading, isError, error } =
     useMutate(axios.put, `http://localhost:5000/project/${projectId}/update`, {
        onSuccess: () => {
            queryClient.invalidateQueries("fetchProjectDetails" + projectId);
            setOpen(false);
        },
        onError: () => {
            alert("error - unauthorized! are you an admin?");
        }
     });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = { ...Object.fromEntries(fd.entries()), team };

        mutate(data);
    }

    const [open, setOpen] = useState(false);
    const [team, setTeam] = useState(Array<string>());

    const { data: users, isLoading: usersLoading, isError: usersIsError, error: usersError } = useFetch(
        "fetch users for update" + projectId, "http://localhost:5000/users"
    );

    return(
        <>
        <Button onClick={() => setOpen(true)} variant="contained">Update project</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <form onSubmit={handleSubmit} style={{
                display: "flex",
                flexDirection: "column",   
            }}>
                <Typography variant="body1">Fill only the fields that you want to update</Typography>
                <TextField label="Project title" name="title" type="text" margin="normal"/>
                <TextField label="Project description" name="description" type="text"  margin="normal"/>
                <Autocomplete
                    onChange={(event, value) => setTeam(value.map((usernameObj) => usernameObj.username))}
                    multiple
                    limitTags={3}
                    options={users ? users.data : []}
                    loading={usersLoading}
                    getOptionLabel={(option: {username: string}) => option.username} // TODO: Remove comment if not necessary
                    renderInput={(params) => 
                        <TextField
                            {...params}
                            placeholder="team"
                            InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                                </>
                            ),
                            }} />}
                    sx={{ width: '500px' }}
                />
                <FormLabel>Status</FormLabel>
                <RadioGroup name="status" defaultValue="development">
                    <FormControlLabel value="development" control={<Radio />} label="development" />
                    <FormControlLabel value="maintenance" control={<Radio />} label="maintenace" />
                </RadioGroup>
                <Button type="submit">Submit</Button>
            </form>
            <>
            {isLoading && 
                <>
                    Updating project...
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
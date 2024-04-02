import React, { useState } from "react";
import { TextField, Button, Dialog, Autocomplete, FormLabel, RadioGroup, CircularProgress, FormControlLabel,
Radio } from "@mui/material";
import { useSelector } from "react-redux";
import { useQueryClient, useMutation, useQuery } from "react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const UpdateTask: React.FC = (): JSX.Element => {
    const { token } = useSelector((state: any) => state.accessToken); // fix 'any'!!!!!!!!!!!!!!!
    
    const [leaders, setLeaders] = useState(Array<any>()); // fix any!!!!!!!!!!!!!!!!!!!11
    const [links, setLinks] = useState(Array<string>());
    const [tags, setTags] = useState(Array<string>());
    // AutoComplete doesn't receive the 'name' prop so its value can't be retrieve in the handeSubmit function

    const projectId = parseInt(useParams().project_id ?? '-1'); // id can't be negative
    const taskId = parseInt(useParams().task_id ?? '-1'); // id can't be negative
    console.log("projectId:" + projectId, "taskId: " + taskId);

    const queryClient = useQueryClient();
    const {mutate, isLoading, isError, error} = useMutation((data: object) => {
        return axios.put(`http://localhost:5000/task/${taskId}/update`, data, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('fetch-details' + taskId);
            setOpen(false);
        }
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), leaders, links, tags, projectId};

        mutate(data);
    }

    const {data: users, isLoading: usersLoading, isError: usersIsError, error: usersError } = useQuery(
        "fetch-team-for-update" + taskId,
        () => {
            return axios.get(`http://localhost:5000/project/${projectId}/team`, {
            headers: {
                Authorization: "Bearer " + token
            }
        }
        );
        }
    );

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="contained">Update task</Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <>
                    <form onSubmit={handleSubmit} style={{
                        display: "flex",
                        flexDirection: "column",   
                    }}>
                        <TextField label="Task title" name="title" type="text" margin="normal"/>
                        <TextField label="Task description" name="description" type="text"  margin="normal"/>
                        <Autocomplete
                            onChange={(event, value) => setLeaders(value)}
                            multiple
                            limitTags={3}
                            options={users ? users.data : []}
                            loading={usersLoading}
                            getOptionLabel={(option: {username: string}) => option.username} // TODO: Remove comment if not necessary
                            renderInput={(params) => 
                                <TextField
                                    {...params}
                                    placeholder="leaders"
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
                        <Autocomplete
                            onChange={(event, value) => setLinks(value)}
                            multiple
                            freeSolo
                            options={[]}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Linked add-ons"/>
                            )}
                            sx={{ width: '500px' }}
                        />
                        <FormLabel>Start date</FormLabel>
                        <input type="date" name="startDate"/>
                        <FormLabel>End date</FormLabel>
                        <input type="date" name="endDate"/>
                        {/* IS THERE A PROBLEM WITH THE DATES!?@E>!?>E#?.err
                        seems that the updated date is a day before what we want */}            
                        <Autocomplete
                            onChange={(event, value) => setTags(value)}
                            multiple
                            limitTags={4}
                            options={["Frontend", "Design", "React", "DB", "Backend"]}
                            // getOptionLabel={(option) => option.title} // TODO: Remove comment if not necessary
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Tags" />
                            )}
                            sx={{ width: '500px' }}
                        />
                        <FormLabel>Status</FormLabel> {/* DEBUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUG!!!!!!!! */}
                        <RadioGroup name="status" defaultValue="pending ">
                            <FormControlLabel value="pending" control={<Radio />} label="pending" />
                            <FormControlLabel value="development" control={<Radio />} label="development" />
                            <FormControlLabel value="maintenance" control={<Radio />} label="maintenance" />
                            <FormControlLabel value="done" control={<Radio />} label="done" />
                        </RadioGroup>
                        <Button type="submit">Submit</Button>
                    </form>
                    {isLoading && 
                        <>
                            Creating task...
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

export default UpdateTask;
import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import useFetch from "../hooks/useFetch";
import useMutate from "../hooks/useMutate";
import ErrorComp from "./ErrorComp";
import { Typography, TextField, Button, Dialog, Autocomplete, FormLabel, RadioGroup, CircularProgress, FormControlLabel,
Radio } from "@mui/material";

interface ITaskFormDialogProps {
    axiosFn: Function,
    route: string,
    toInvalidate: string
}

const TaskFormDialog: React.FC<ITaskFormDialogProps> = ({ axiosFn, route, toInvalidate }): JSX.Element => {
    const toCreate = axiosFn === axios.post;
    
    const [open, setOpen] = useState(false);
    
    const [leaders, setLeaders] = useState(Array<string>());
    const [links, setLinks] = useState(Array<string>());
    const [tags, setTags] = useState(Array<string>());
    // AutoComplete doesn't receive the 'name' prop so its value can't be retrieve in the handeSubmit function

    const projectId = useParams().project_id;
    const taskId = useParams().task_id;

    const queryClient = useQueryClient();

    const { data: usersData, isLoading: usersLoading, isError: usersIsError, error: usersError } =
     useFetch("fetchTeamForUpdate", `http://localhost:5000/project/${projectId}/team`);

    const { mutate, isLoading, isError, error } = useMutate(axiosFn, route, {
        onSuccess: () => {
            queryClient.invalidateQueries(toInvalidate);
            setOpen(false);
        }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), leaders, links, tags};
        mutate(data);
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="contained">
                {toCreate ? <>Create a new task</> : <>Update task</>}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                {usersIsError ? <ErrorComp err={usersError} />
                :
                (isError ? <ErrorComp err={error} />
                :
                <>
                    <form onSubmit={handleSubmit} autoComplete="off" style={{
                        display: "flex",
                        flexDirection: "column",   
                    }}>
                        {toCreate ?
                        <></>
                        :
                        <Typography variant="body1">
                            Fill only the fields that you want to update.
                            Note: Admins can update the entire task, leaders can update the title, the description
                            and the status, and non-leaders are unauthorized.
                        </Typography>
                        }
                        <TextField label="Task title" name="title" type="text" margin="normal" required={toCreate} />
                        <TextField label="Task description" name="description" type="text"  margin="normal"
                         required={toCreate} />
                        <Autocomplete
                            onChange={(_, value) =>
                                 setLeaders(value.map((usernameObj: { username: string }) => usernameObj.username))}
                            multiple
                            limitTags={3}
                            options={usersData ? usersData.data : []}
                            loading={usersLoading}
                            getOptionLabel={(option: {username: string}) => option.username}
                            renderInput={(params) => 
                                <TextField
                                    {...params}
                                    required={toCreate && leaders.length === 0}
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
                            onChange={(_, value) => setLinks(value)}
                            multiple
                            freeSolo
                            options={[]}
                            renderInput={(params) => (
                                <TextField
                                    {...params} 
                                    required={toCreate && links.length === 0} 
                                    placeholder="Linked add-ons"
                                />
                            )}
                            sx={{ width: '500px' }}
                        />
                        <FormLabel>Start date</FormLabel>
                        <input type="date" name="startDate" required={toCreate} />
                        <FormLabel>End date</FormLabel>
                        <input type="date" name="endDate" required={toCreate} />
                        {/* IS THERE A PROBLEM WITH THE DATES!?@E>!?>E#?.err
                        seems that the updated date is a day before what we want */}            
                        <Autocomplete
                            onChange={(_, value) => setTags(value)}
                            multiple
                            limitTags={4}
                            options={["Frontend", "Design", "React", "DB", "Backend"]}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required={toCreate && tags.length === 0} 
                                    placeholder="Tags"
                                />
                            )}
                            sx={{ width: '500px' }}
                        />
                        <FormLabel>Status</FormLabel>
                        <RadioGroup name="status" defaultValue="pending">
                            <FormControlLabel value="pending" control={<Radio />} label="pending" />
                            <FormControlLabel value="development" control={<Radio />} label="development" />
                            <FormControlLabel value="maintenance" control={<Radio />} label="maintenance" />
                            <FormControlLabel value="done" control={<Radio />} label="done" />
                        </RadioGroup>
                        <Button type="submit">Submit</Button>
                    </form>
                    {isLoading ? 
                    <>
                        Creating task...
                        <br />
                        <CircularProgress />
                    </>
                    :
                    <></>
                    }
                </>
                )
                }
            </Dialog>
        </>
    );
}

export default TaskFormDialog;
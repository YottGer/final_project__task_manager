import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import useFetch from "../hooks/useFetch";
import useMutate from "../hooks/useMutate";
import { 
    Button, Dialog, Typography, TextField, Autocomplete, FormLabel, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import ErrorComp from "./ErrorComp";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import Loading from "./Loading";

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
    // AutoComplete doesn't receive the 'name' prop so its value can't be retrieved in the handleSubmit function

    const projectId = useParams().project_id;

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
                                        {<Loading enabled={usersLoading} msg="" />}
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
                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <DatePicker name="startDate" label="Start date" format="DD/MM/YYYY" sx={{margin: "7.5px"}}
                             defaultValue={toCreate ? dayjs("01/01/2000") : undefined} />
                            <DatePicker name="endDate" label="End date" format="DD/MM/YYYY" sx={{margin: "5px"}}
                             defaultValue={toCreate ? dayjs("01/01/2000") : undefined} />
                        </LocalizationProvider>          
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
                    <Loading enabled={isLoading} msg="Sending data to server..." />
                </>
                )
                }
            </Dialog>
        </>
    );
}

export default TaskFormDialog;
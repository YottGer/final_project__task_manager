import React, { useState } from "react";
import { TextField, Autocomplete, Button, FormLabel, CircularProgress, Dialog, RadioGroup, FormControlLabel,
 Radio } from "@mui/material";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "react-query";
import axios from "axios";
import { useSelector } from "react-redux";

const CreateTask: React.FC<{team: {username: string}[]}> = ({ team }): JSX.Element => {
    const { token } = useSelector((state: any) => state.accessToken); // fix 'any'!!!!!!!!!!!!!!!
    
    const [leaders, setLeaders] = useState(Array<String>());
    const [links, setLinks] = useState(Array<string>());
    const [tags, setTags] = useState(Array<string>());
    // AutoComplete doesn't receive the 'name' prop so its value can't be retrieve in the handeSubmit function

    const projectId = parseInt(useParams().projectId ?? '-1'); // id can't be negative

    const queryClient = useQueryClient();
    const {mutate, isLoading, isError, error} = useMutation((data: object) => {
        return axios.post("http://localhost:5000/create_task", data);
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('fetch-tasks' + projectId);
            setOpen(false);
        }
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), leaders, links, tags, projectId};

        mutate(data);
    }

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="contained">Create a new task</Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <>
                    <form onSubmit={handleSubmit} style={{
                        display: "flex",
                        flexDirection: "column",   
                    }}>
                        <TextField label="Task title" name="title" type="text" margin="normal"/>
                        <TextField label="Task description" name="description" type="text"  margin="normal"/>
                        <Autocomplete
                            onChange={(event, value) => setLeaders(value.map(usernameObj => usernameObj.username))}
                            multiple
                            limitTags={3}
                            options={team}
                            getOptionLabel={(option: {username: string}) => option.username} // TODO: Remove comment if not necessary
                            renderInput={(params) => <TextField {...params} placeholder="leaders" />}
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

export default CreateTask;

//TODO: Validation (In addition to server-side validation?)
// TODO: Handle code duplivation (see createProject...)
//TODO: Prevent form completion suggestions
//TODO: reset form after succsess (onSuccess)
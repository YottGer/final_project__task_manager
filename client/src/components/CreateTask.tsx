import React, { useState } from "react";
import { TextField, Autocomplete, Button, FormLabel } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

const CreateTask: React.FC = (): JSX.Element => {
    const [leaders, setLeaders] = useState(Array<string>());
    const [links, setLinks] = useState(Array<string>());
    const [tags, setTags] = useState(Array<string>());
    // AutoComplete doesn't receive the 'name' prop so its value can't be retrieve in the handeSubmit function

    const projectId = parseInt(useParams().project_id ?? '-1'); // id can't be negative

    const navigate = useNavigate();

    const {mutate, isLoading, isError, error} = useMutation((data: object) => {
        return axios.post("http://localhost:5000/create_task", data);
    }, {
        onSuccess: () => {navigate(`/project/${projectId}`)}
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = {...Object.fromEntries(fd.entries()), leaders, links, tags, projectId};

        mutate(data);
    }

    return (
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
                    limitTags={2}
                    options={["dummy1", "dummy2"]}
                    // getOptionLabel={(option) => option.title} // TODO: Remove comment if not necessary
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Leaders"/>
                    )}
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
                <Button type="submit">Submit</Button>
            </form>
            {isLoading && <div>Submitting form...</div>}
            {isError && <div>An error has occured while trying to submit the form...</div> /*TODO: Specify error*/ }
        </>
    );
}

export default CreateTask;

//TODO: Validation (In addition to server-side validation?)
// TODO: Handle code duplivation (see createProject...)
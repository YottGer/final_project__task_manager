import React, { useState } from "react";
import axios from "axios";
import useFetch from "../hooks/useFetch";
import useMutate from "../hooks/useMutate";
import ErrorComp from "./ErrorComp";
import {
    Typography, TextField, Autocomplete, FormLabel, RadioGroup, FormControlLabel, Radio, Button
} from "@mui/material";
import Loading from "./Loading";

interface IUseMutateParams {
    axiosFn: Function, 
    route: string, 
    mutationConfig: object
}

const ProjectForm: React.FC<IUseMutateParams> = ({ axiosFn, route, mutationConfig }): JSX.Element => {
    const toCreate = axiosFn === axios.post;
    const [team, setTeam] = useState(Array<string>());
    // AutoComplete doesn't receive the 'name' prop so its value can't be retrieve in the handeSubmit function

    const { data: usersData, isLoading: usersLoading, isError: usersIsError, error: usersError } = useFetch(
        "fetchUsers", "http://localhost:5000/users"
    );

    const { mutate, isLoading, isError, error } = useMutate(axiosFn, route, mutationConfig);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = { ...Object.fromEntries(fd.entries()), team };
        mutate(data);
    }

    if (usersIsError)
        return <ErrorComp err={usersError} />;

    if (isError)
        return <ErrorComp err={error} />;

    return (
        <>
            <form onSubmit={handleSubmit} autoComplete="off" style={{
                display: "flex",
                flexDirection: "column",   
            }}>
                {toCreate ? <></> : <Typography variant="body1">Fill only the fields that you want to update</Typography>}
                <TextField label="Project title" name="title" type="text" margin="normal" required={toCreate}/>
                <TextField label="Project description" name="description" type="text"  margin="normal"
                 required={toCreate} />
                <Autocomplete
                    onChange={(_, value) => setTeam(value.map((usernameObj) => usernameObj.username))}
                    multiple
                    limitTags={3}
                    options={usersData ? usersData.data : []}
                    loading={usersLoading}
                    getOptionLabel={(option: { username: string }) => option.username}
                    renderInput={(params) => 
                        <TextField
                            {...params}
                            required={toCreate && team.length === 0}
                            placeholder="team"
                            InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                {<Loading enabled={usersLoading} msg="" />}
                                {params.InputProps.endAdornment}
                                </>
                            )
                            }}
                        />}
                    sx={{ width: '500px' }}
                />
                <FormLabel>Status</FormLabel>
                <RadioGroup name="status" defaultValue="development">
                    <FormControlLabel value="development" control={<Radio />} label="development" />
                    <FormControlLabel value="maintenance" control={<Radio />} label="maintenance" />
                </RadioGroup>
                <Button type="submit" disabled={isLoading}>Submit</Button>
            </form>
            <Loading enabled={isLoading} msg="Sending data to server..." />
        </>
    );
}

export default ProjectForm;
import React, { useState } from "react";
import {
     TextField, RadioGroup, FormControlLabel, Radio, FormLabel, Button, Autocomplete, CircularProgress
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CreateProjectPage: React.FC = (): JSX.Element => {
    const accessToken = useSelector((state: any) => state.accessToken); // fix 'any'!!!!!!!!!!!!!!!
    console.log("create project page token ", accessToken);

    const navigate = useNavigate();

    const {mutate, isLoading, isError, error} = useMutation((data: object) => {
        return axios.post("http://localhost:5000/create_project", data, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        });
    }, {
        onSuccess: () => {navigate("/")}
    })

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = { ...Object.fromEntries(fd.entries()), team };
        
        mutate(data);
    }

    const {data: users, isLoading: usersLoading, isError: usersIsError, error: usersError } = useQuery(
        "fetch-users",
        () => {
            return axios.get("http://localhost:5000/users", {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        }
        );
        }
    );

    const [team, setTeam] = useState(Array<any>()); // fix any!!!!!!!!!!!!!!!!!!!

    return (
        <>
            <form onSubmit={handleSubmit} style={{
                display: "flex",
                flexDirection: "column",   
            }}>
                <TextField label="Project title" name="title" type="text" margin="normal"/>
                <TextField label="Project description" name="description" type="text"  margin="normal"/>
                <Autocomplete
                    onChange={(event, value) => setTeam(value)}
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
            
            {isLoading && <div>Submitting form...</div>}
            {isError && <div>An error has occured while trying to submit the form...</div> /*TODO: Specify error*/ }
        </>
    );
}

export default CreateProjectPage;

//TODO: handle onSuccess (modal? QueryValidation?) handle errors...
//TODO: Validation (In addition to server-side validation?)
//TODO: Prevent form completion suggestions
import React from "react";
import { TextField, RadioGroup, FormControlLabel, Radio, FormLabel, Button } from "@mui/material";
import axios from "axios";

const CreateProjectPage: React.FC = (): JSX.Element => {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget); // .target doesn't work
        const data = Object.fromEntries(fd.entries());
        
        axios.post("http://localhost:5000/create_project", data);
    }

    return (
        <form onSubmit={handleSubmit} style={{
            display: "flex",
            flexDirection: "column",   
        }}>
            <TextField label="Project title" name="title" type="text" margin="normal"/>
            <TextField label="Project description" name="description" type="text"  margin="normal"/>
            <FormLabel>Status</FormLabel>
            <RadioGroup name="Project status" defaultValue="development">
                <FormControlLabel value="development" control={<Radio />} label="development" />
                <FormControlLabel value="maintenance" control={<Radio />} label="maintenace" />
            </RadioGroup>
            <Button type="submit">Submit</Button>
        </form>
    );
}

export default CreateProjectPage;
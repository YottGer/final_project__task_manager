import React from "react";
import { TextField, Autocomplete, DatePicker, FormControlLabel, Radio, FormLabel, Button } from "@mui/material";
import axios from "axios";

const CreateTask: React.FC = (): JSX.Element => {
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
            <TextField label="Task title" name="title" type="text" margin="normal"/>
            <TextField label="Task description" name="description" type="text"  margin="normal"/>
            <Autocomplete
                multiple
                limitTags={2}
                options={["dummy1", "dummy2"]}
                // getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                    <TextField {...params} placeholder="Leaders" />
                )}
                sx={{ width: '500px' }}
            />            
            <DatePicker />
            <Button type="submit">Submit</Button>
        </form>
    );
}

export default CreateTask;
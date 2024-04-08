import React from "react";
import { IProject } from "./pages/HomePage";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const Project: React.FC<IProject> = ({ id, title, description, status }): JSX.Element => {
    return (
        <ListItem disablePadding component={Link} to={`/project/${id}`} >
            <ListItemButton>
                 <ListItemText primary={title + ": " + description} secondary={status} />
            </ListItemButton>
        </ListItem>
    );
}

export default Project;
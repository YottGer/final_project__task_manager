import React from "react";
import { ITask } from "./pages/ProjectPage";
import { ListItem, ListItemButton, ListItemText, Chip } from "@mui/material";
import { Link } from "react-router-dom";

const Task: React.FC<ITask> = ({ id, projectId, title, description, tags, status }): JSX.Element => {
    return (
        <ListItem disablePadding component={Link} to={`/project/${projectId}/task/${id}`} >
            <ListItemButton>
                 <ListItemText primary={title + ": " + description} secondary={status} />
                 {tags?.map((tagStr, index: number) =>
                  <Chip key={`Tag ${index} for task ${id}`} color="info" label={tagStr} />)}
            </ListItemButton>
        </ListItem>
    );
}

export default Task;
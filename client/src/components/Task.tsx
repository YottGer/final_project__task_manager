import React from "react";
import { ITask } from "./pages/ProjectPage";
import { Card, CardActionArea, Typography, Chip, ListItem, ListItemText, ListItemButton } from "@mui/material";
import { Link } from "react-router-dom";

const Task: React.FC<ITask> = ({ id, projectId, title, description, tags, status }): JSX.Element => {
    console.log(tags);
    return (
        // <Card>
        //     <CardActionArea component={Link} to={`/project/${projectId}/task/${id}`}>
        //         <Typography variant="body1">Title: {title}</Typography>
        //         <Typography variant="body2">Description: {description}</Typography>
        //         {tags?.map(tagStr => <Chip color="info" label={tagStr} />)}
        //     </CardActionArea>
        //  </Card>
        <ListItem disablePadding component={Link} to={`/project/${projectId}/task/${id}`} >
            <ListItemButton>
                 <ListItemText primary={title + ": " + description} secondary={status} />
                 {tags?.map(tagStr => <Chip color="info" label={tagStr} />)}
            </ListItemButton>
        </ListItem>
    );
}

export default Task;

//TODO: Handle code multiplication (see project component)
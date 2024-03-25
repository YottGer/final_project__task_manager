import React from "react";
import { IProject } from "./pages/HomePage";
import { Card, CardActionArea, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Project: React.FC<IProject> = ({ id, title, description, status }): JSX.Element => {
    return (
        <Card>
            <CardActionArea component={Link} to={`/project/${id}`}>
                <Typography variant="body1">Title: {title}</Typography>
                <Typography variant="body2">Description: {description}</Typography>
                <Typography variant="body2">Status: {status}</Typography>
            </CardActionArea>
         </Card>
    );
}

export default Project;
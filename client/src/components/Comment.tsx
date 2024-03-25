import React from "react";
import { IComment } from "./pages/TaskPage";
import { Card, Typography } from "@mui/material";

const Comment: React.FC<IComment> = ({title, content}): JSX.Element => {
    return (
        <Card>
            <Typography variant="body1">{title}</Typography>
            <Typography variant="body2">{content}</Typography>
        </Card>
    );
}

export default Comment;
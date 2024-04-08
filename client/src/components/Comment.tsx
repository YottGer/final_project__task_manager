import React from "react";
import { IComment } from "./pages/TaskPage";
import { ListItem, ListItemText } from "@mui/material";

const Comment: React.FC<IComment> = ({title, content}): JSX.Element => {
    return (
        <ListItem>
            <ListItemText primary={title} secondary={content} />
        </ListItem>
    );
}

export default Comment;
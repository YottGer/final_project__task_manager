import { Typography, CircularProgress } from "@mui/material";
import React from "react";

const Loading: React.FC<{ enabled: boolean, msg: string }> = ({ enabled, msg }): JSX.Element => {
    if (enabled)
        return (
            <div style={{display: "flex", flexDirection: "column"}}>
            <Typography>{msg}</Typography>
            <CircularProgress />
            </div>
        );
    return <></>;
}

export default Loading;
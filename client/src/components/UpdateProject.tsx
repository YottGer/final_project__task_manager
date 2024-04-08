import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "react-query";
import { Button, Dialog } from "@mui/material";
import ProjectForm from "./ProjectForm";
import axios from "axios";

const UpdateProject: React.FC = (): JSX.Element => {
    const [open, setOpen] = useState(false);
    const projectId = useParams().project_id;
    const queryClient = useQueryClient();

    return(
        <>
            <Button onClick={() => setOpen(true)} variant="contained">Update project</Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <ProjectForm
                    axiosFn={axios.put}
                    route={`http://localhost:5000/project/${projectId}/update`}
                    mutationConfig={{
                        onSuccess: () => {
                            queryClient.invalidateQueries("fetchProjectDetails" + projectId);
                            setOpen(false);
                        }
                    }}
                />  
            </Dialog>
        </>
    );
}

export default UpdateProject;
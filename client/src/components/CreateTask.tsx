import React from "react";
import { useParams } from "react-router-dom";
import TaskFormDialog from "./TaskFormDialog";
import axios from "axios";

const CreateTask: React.FC = (): JSX.Element => {
    const projectId = useParams().project_id;

    return(
        <TaskFormDialog
            axiosFn={axios.post}
            route={`http://localhost:5000/project/${projectId}/create_task`}
            toInvalidate={"fetchTasksForProject" + projectId}
        />
    );
}

export default CreateTask;
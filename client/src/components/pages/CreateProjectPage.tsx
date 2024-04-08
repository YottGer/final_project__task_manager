import React from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../ProjectForm";
import axios from "axios";

const CreateProjectPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();

    return (
    <ProjectForm
        axiosFn={axios.post}
        route={"http://localhost:5000/create_project"}
        mutationConfig={{
            onSuccess: () => {navigate("/");},
        }}
    />
    );
}

export default CreateProjectPage;
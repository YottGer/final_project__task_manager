import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { setToken, setUsername, setIsAdmin } from "../features/accessToken/accessTokenSlice";

const ErrorComp: React.FC<{ err: unknown }> = ({ err }): JSX.Element => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    console.log("ErrorComp: ", err);
    if (err instanceof AxiosError && err.response?.data === "Access token verification failed: jwt expired") {
        dispatch(setToken(""));
        dispatch(setUsername(""));
        dispatch(setIsAdmin(false));
        navigate("/login");
    }

    if (err instanceof AxiosError && err.response?.status === 403) return <> You are unauthorized! </>;

    return (
        <>
            Oops! something went wrong!
            <br></br>
            {err instanceof Error ? err.message : <>This is an unknown error</>}
        </>
    );
}

export default ErrorComp;
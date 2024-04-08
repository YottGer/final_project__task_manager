import React from "react";

const ErrorComp: React.FC<{ err: unknown }> = ({ err }): JSX.Element => {
    console.log("ErrorComp: ", err);
    return (
        <>
        Oops! something went wrong!
        <br></br>
        {err instanceof Error ? err.message : <>This is an unknown error</>}
        </>
    );
}

export default ErrorComp;
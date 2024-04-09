import { useSelector } from "react-redux";
import { useMutation } from "react-query";

interface IAccessTokenState {
    accessToken: {
        token: string,
        username: string
    }
}

const useMutate = (axiosFn: Function, route: string, mutationConfig?: object) => {
    const { token } = useSelector((state: IAccessTokenState) => state.accessToken);
    return useMutation((data: any) => {
        return axiosFn(route, data, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
    }, mutationConfig);
}

export default useMutate;
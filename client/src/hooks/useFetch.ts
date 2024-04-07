import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import axios from "axios";

interface IAccessTokenState { // this is code duplication!!!!!!!!!!!!!!!!!!
    accessToken: {
        token: string,
        username: string
    }
}

const useFetch = (queryKey: string, route: string, queryConfig?: object) => {
    const { token } = useSelector((state: IAccessTokenState) => state.accessToken);
    return useQuery(queryKey, () => {
        return axios.get(route, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
    }, queryConfig);
}

export default useFetch;
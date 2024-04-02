import React from "react";
import { FormControlLabel, Switch } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setIsDarkTheme } from "../features/isDarkTheme/isDarkThemeSlice";

const ThemeSwitch: React.FC = (): JSX.Element => {
    const { isDarkTheme } = useSelector((state: any) => state.isDarkTheme); // fix any!!!!!!!!!!11
    const dispatch = useDispatch();

    return(
        <FormControlLabel label="Dark mode" control={
            <Switch checked={isDarkTheme} onChange={
                (event: React.ChangeEvent<HTMLInputElement>) => {
                    dispatch(setIsDarkTheme(event.target.checked));
                }
            } />
        } />
    );
}

export default ThemeSwitch;
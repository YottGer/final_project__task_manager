import { createSlice } from "@reduxjs/toolkit";

export const isDarkThemeSlice = createSlice({
    name: 'isDarkTheme',
    initialState: {
        isDarkTheme: false
    },
    reducers: {
        setIsDarkTheme: (state, action) => {
            state.isDarkTheme = action.payload;
        }
    }
});

export const { setIsDarkTheme } = isDarkThemeSlice.actions;

export default isDarkThemeSlice.reducer;
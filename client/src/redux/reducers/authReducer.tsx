import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SESSION_STORAGE_TOKEN } from "../../const/const";

const getStoredToken = (): string | undefined => {
  if (typeof sessionStorage === "undefined") return undefined;
  const token = sessionStorage.getItem(SESSION_STORAGE_TOKEN);
  return token ?? undefined;
};

const storedToken = getStoredToken();

const initialState: {
  isAuthenticated: boolean;
  token: string | undefined;
} = {
  isAuthenticated: !!storedToken,
  token: storedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth(state, action: PayloadAction<typeof initialState>) {
      const { isAuthenticated, token } = action.payload;
      state.isAuthenticated = isAuthenticated;
      state.token = token;
    },
  },
});

export const { setAuth } = authSlice.actions;
export default authSlice.reducer;

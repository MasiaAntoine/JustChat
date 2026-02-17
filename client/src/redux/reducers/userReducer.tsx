import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserDTO } from "../../apis/IUserDTO";
import { SESSION_STORAGE_USER } from "../../const/const";

const getStoredUser = (): IUserDTO | null => {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_USER);
    if (!raw) return null;
    const data = JSON.parse(raw) as IUserDTO;
    if (typeof data._id === "string" && data._id) return data;
    return null;
  } catch {
    return null;
  }
};

const defaultUser: IUserDTO = {
  name: "",
  email: "",
  pictureId: 1,
  online: false,
  _id: "",
};

const initialState: IUserDTO = getStoredUser() ?? defaultUser;

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUserDTO>) {
      for (const [key, value] of Object.entries(action.payload)) {
        state[key as keyof IUserDTO] = value as never;
      }
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

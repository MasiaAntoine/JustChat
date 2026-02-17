import axios from "axios";
import { LOCAL_ROUTE } from "../../const/const";
import { SESSION_STORAGE_TOKEN } from "../../const/const";

export const uploadImage = async (file: File): Promise<string> => {
  const token = sessionStorage.getItem(SESSION_STORAGE_TOKEN);
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await axios.post<{ image: string }>(`${LOCAL_ROUTE}/chat/upload-image`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.image;
};

import axios from "axios";

export const appAxios = axios.create({
  baseURL: "https://itunes.apple.com",
});

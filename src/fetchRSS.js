import axios from "axios";

export const fetchFeed = async () => {
  const { data } = await axios.get("/api/articles");
  return data;
};
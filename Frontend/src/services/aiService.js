import api from "./api";

export const askCozyStayAssistant = async (payload) => {
  const { data } = await api.post("/ai/assistant", payload);
  return data;
};

export const generatePropertyDescription = async (payload) => {
  const { data } = await api.post("/ai/generate-description", payload);
  return data;
};

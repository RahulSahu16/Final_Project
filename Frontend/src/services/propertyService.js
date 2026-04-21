import api from "./api";

export const getProperties = async () => {
  const { data } = await api.get("/properties");
  if (Array.isArray(data)) return data;
  return data?.data?.properties || [];
};

export const getPropertyById = async (id) => {
  const { data } = await api.get(`/properties/${id}`);
  return data?.data?.property || data;
};

export const searchProperties = async (params) => {
  const { data } = await api.get("/properties/search", { params });
  if (Array.isArray(data)) return data;
  return data?.data?.properties || [];
};

export const createProperty = async (formData) => {
  const { data } = await api.post("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data?.property || data;
};

export const updateProperty = async (id, formData) => {
  const { data } = await api.put(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data?.property || data;
};

export const deleteProperty = async (id) => {
  const { data } = await api.delete(`/properties/${id}`);
  return data;
};

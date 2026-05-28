import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export async function getAssignments() {
  const res = await api.get("/api/assignments");
  return res.data;
}

export async function getAssignment(id: string) {
  const res = await api.get(`/api/assignments/${id}`);
  return res.data;
}

export async function createAssignment(data: unknown) {
  const res = await api.post("/api/assignments", data);
  return res.data;
}

export async function deleteAssignment(id: string) {
  const res = await api.delete(`/api/assignments/${id}`);
  return res.data;
}

export async function regenerateAssignment(id: string) {
  const res = await api.post(`/api/assignments/${id}/regenerate`);
  return res.data;
}

export async function downloadPdf(id: string) {
  const res = await api.get(`/api/pdf/${id}`, {
    responseType: "blob"
  });

  return res.data as Blob;
}

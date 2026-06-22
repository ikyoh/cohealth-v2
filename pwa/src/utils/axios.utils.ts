import axios from "axios";
import { API_URL } from "./api.utils";
import { getAuthToken } from "./authToken";

const client = axios.create({ baseURL: API_URL });

export const request = async ({
  method = "get",
  headers = {},
  data = undefined,
  ...options
}: {
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  [key: string]: any;
}) => {
  const token = getAuthToken();

  // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement avec la boundary)
  const isFormData = data instanceof FormData;

  let contentType: string | undefined = "application/ld+json";
  if (method.toLowerCase() === "patch") {
    contentType = "application/merge-patch+json";
  }
  if (isFormData) {
    contentType = undefined;
  }

  const finalHeaders: Record<string, string> = {
    ...(contentType && { "Content-Type": contentType }),
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
    ...headers,
  };

  const onSuccess = (response: any) => {
    //console.log("Axios utils response", response);
    return response.data;
  };
  const onError = (error: any) => {
    console.log("Axios utils error", error);
    return Promise.reject(error);
  };

  //await new Promise((resolve) => setTimeout(resolve, 4000));

  return client({ method, headers: finalHeaders, data, ...options })
    .then(onSuccess)
    .catch(onError);
};

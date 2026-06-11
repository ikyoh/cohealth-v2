export const API_URL = "https://localhost/";
export const API_LOGIN = "/login";
export const API_LOGOUT = "/logout";
export const API_PASSWORD = "/forgot-password";
export const API_CURRENT_USER = "/current_user";
export const API_ITEMS = "/items";
export const API_CATEGORIES = "/categories";
export const API_CONTAINERS = "/containers";
export const API_USERS = "/users";

export const itemsPerPage = 10;

export const generateSearchParamsURL = (searchParams: URLSearchParams) => {
  const searchFromParams: object = Object.fromEntries(searchParams.entries());

  let defaultSearch: object = {
    page: 1,
  };

  let searchParamsURL: string = new URLSearchParams({
    ...defaultSearch,
    ...searchFromParams,
  }).toString();
  return searchParamsURL;
};

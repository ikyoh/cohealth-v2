import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
//import { generatePassword } from "utils/functions.utils";
import { request } from "@/utils/axios.utils";
import { useSearchParams } from "next/navigation";

/* définir le type de données */
type Collection = {
  entity: string;
  searchParams?: string;
  filters?: string;
};

type Count = {
  count?: number;
};

/* API REQUESTS */

const fetchCollection = ({ entity, searchParams, filters }: Collection) => {
  let options = searchParams || filters ? "?" : "";
  if (searchParams) options += searchParams;
  if (filters) options += searchParams ? "&" + filters : filters;
  return request({ url: "/" + entity + options, method: "get" });
};

const fetchData = (iri: string) => {
  return request({ url: iri, method: "get" });
};

const fetchIRI = (iri: string) => {
  return request({ url: iri, method: "get" });
};

const postData = (form: any, entity: string) => {
  return request({ url: "/" + entity, method: "post", data: form });
};

const putData = (form: any) => {
  return request({ url: form.iri, method: "put", data: form });
};

const patchData = (form: any) => {
  const { iri, ...patch } = form ?? {};
  return request({ url: iri, method: "patch", data: patch });
};

const deleteIRI = (iri: any) => {
  return request({ url: iri, method: "delete" });
};

const entityFromIRI = (iri: string) => {
  const match = iri.match(/\/([^\/]+)\//);
  return match ? match[1] : null;
};

function remove_uuid(data, uuid) {
  return data.filter(
    (x) => x["hydra:member"].filter((y) => y["@id"].includes(uuid)).length == 0
  );
}

/* HOOKS */

export const useGetCollection = ({
  entity,
  searchParams = "",
  filters = "",
}: Collection) => {
  return useQuery({
    queryKey: [entity, searchParams, filters],
    queryFn: () =>
      fetchCollection({
        entity,
        searchParams,
        filters,
      }),
  });
};

export const useGetInfiniteCollection = ({
  entity,
  search,
  filters,
}: {
  entity: string;
  search?: string;
  filters?: string;
}) => {
  const params = useSearchParams();
  const urlSearchParams = new URLSearchParams(params!);
  const fixedFilters = new URLSearchParams(filters);

  fixedFilters.forEach((value, key) => {
    urlSearchParams.set(key, value);
  });

  if (search) {
    urlSearchParams.set("search", search);
  }

  urlSearchParams.set("page", "1");
  const initialPage = `${entity}?${urlSearchParams.toString()}`;

  return useInfiniteQuery({
    queryKey: [entity, initialPage, filters],
    queryFn: ({ pageParam }) => fetchIRI(pageParam),
    getNextPageParam: (data) => {
      return data["view"] && data["view"]["next"]
        ? data["view"]["next"]
        : undefined;
    },
    initialPageParam: initialPage,
  });
};

export const useGetData = (iri: string) => {
  return useSuspenseQuery({
    queryKey: [iri],
    queryFn: () => fetchData(iri),
  });
};

export const useGetIRI = (iri: string) => {
  return useQuery({
    queryKey: [iri],
    queryFn: () => fetchData(iri),
    enabled: iri ? true : false,
  });
};

export const useGetSuspenseIRI = (iri: string) => {
  return useSuspenseQuery({
    queryKey: [iri],
    queryFn: () => fetchData(iri),
  });
};

export const usePostQuery = (entity: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData | any) => postData(form, entity),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      queryClient.invalidateQueries({ queryKey: ["/count/" + entity] });
    },
  });
};

export const usePutQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form) => putData(form),

    // When mutate is called:
    onMutate: async (data: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [data["@id"]] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([data["@id"]]);

      // Optimistically update to the new value
      queryClient.setQueryData([data["@id"]], data);

      // // Return a context with the previous and new todo
      return { previousData, data };
    },
    // If the mutation fails, use the context we returned above
    onError: (error, data, context) => {
      //queryClient.setQueryData([data["@id"]], context.previousData);
    },
    // Always refetch after error or success:
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [variables.iri] });
      queryClient.invalidateQueries({
        queryKey: [entityFromIRI(variables.iri)],
      });
    },
  });
};

export const usePatchQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form) => patchData(form),

    // When mutate is called:
    onMutate: async (data: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [data["@id"]] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([data["@id"]]);

      // Optimistically update to the new value
      queryClient.setQueryData([data["@id"]], data);

      // // Return a context with the previous and new todo
      return { previousData, data };
    },
    // If the mutation fails, use the context we returned above
    onError: (error, data, context) => {
      //queryClient.setQueryData([data["@id"]], context.previousData);
    },
    // Always refetch after error or success:
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [variables.iri] });
      queryClient.invalidateQueries({
        queryKey: [entityFromIRI(variables.iri)],
      });
    },
  });
};

export const useDeleteIRI = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (iri) => deleteIRI(iri),
    onMutate: (iri: string) => {
      queryClient.cancelQueries({ queryKey: [iri] });
      // const savedData = queryClient.getQueryData([iri]);
      // const entity = entityFromIRI(iri);
      // const savedCount = queryClient.getQueryData(["/count/" + entity]) as {
      //   count: number;
      // };

      // const savedCollection = queryClient.getQueriesData({
      //   queryKey: ["categories"],
      //   type: "all",
      // });

      // savedCollection.map((collection) => {
      //   queryClient.setQueryData(
      //     collection[0],
      //     remove_uuid(collection[1], iri)
      //   );
      // });

      // queryClient.setQueryData(["/count/" + entityFromIRI(iri)], {
      //   count: savedCount.count - 1,
      // });

      // return { savedData, savedCount };
    },
    onSettled: (data, error, variables, context) => {
      queryClient.removeQueries({ queryKey: [variables], exact: true });
      queryClient.invalidateQueries({ queryKey: [entityFromIRI(variables)] });
      queryClient.invalidateQueries({
        queryKey: ["/count/" + entityFromIRI(variables)],
      });
    },
    // onError: (error, iri, context) => {
    //   queryClient.setQueryData(
    //     ["/count/" + entityFromIRI(iri)],
    //     context.savedData
    //   );
    //   queryClient.setQueryData(["/count/" + entityFromIRI(iri)], {
    //     count: context.savedCount,
    //   });
    // },
  });
};

export const useCombinedQueries = (iris: string[]) => {
  return useQueries({
    queries: iris.map((iri) => ({
      queryKey: [iri],
      queryFn: () => fetchIRI(iri),
      enabled: iri ? true : false,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        isPending: results.some((result) => result.isPending),
        isLoading: results.some((result) => result.isLoading),
        isSuccess: results.some((result) => result.isSuccess),
      };
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { request } from "../utils/axios.utils";

const usePostQueries = (entity) => {
    const queryClient = useQueryClient();
    const isSubmitting = useRef(false);
    const mutation = useMutation({
        mutationFn: (queries) => Promise.all(
            queries.map((query) => request({
                url: "/" + entity,
                method: "post",
                data: query,
            })),
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [entity] });
            queryClient.invalidateQueries({ queryKey: ["/count/" + entity] });
        },
        onSettled: () => {
            isSubmitting.current = false;
        },
    });

    const setQueries = (queries) => {
        if (isSubmitting.current || queries.length === 0) {
            return;
        }

        isSubmitting.current = true;
        mutation.mutate(queries);
    };

    return {
        isSuccess: mutation.isSuccess,
        isLoading: mutation.isPending,
        setQueries,
    };
};

export default usePostQueries;

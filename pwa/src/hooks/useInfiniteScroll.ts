import { useGetInfiniteCollection } from "@/hooks/useQuery";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

const useInfiniteScroll = ({
  entity,
  search,
  filters,
}: {
  entity: string;
  search?: string;
  filters?: string;
}) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const searchParams = useSearchParams();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch,
  } = useGetInfiniteCollection({ entity, search, filters });

  useEffect(() => {
    refetch();
  }, [searchParams, refetch]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | HTMLTableRowElement) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetching, isLoading]
  );

  const datas = useMemo(() => {
    return data?.pages.reduce<any[]>((acc, page) => {
      return [...acc, ...page["member"]];
    }, []);
  }, [data]);

  const totalItems = data?.pages ? data.pages[0]["totalItems"] : 0;

  return {
    datas,
    totalItems,
    lastElementRef,
    isFetching,
    error,
    isLoading,
    refetch,
  };
};

export default useInfiniteScroll;

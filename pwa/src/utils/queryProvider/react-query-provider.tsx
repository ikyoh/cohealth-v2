"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 9000_0000,
        staleTime: 6000_000,
        refetchOnWindowFocus: false,
        //refetchInterval: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-right"
      /> */}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;

import PagesLayout from "@/components/modules/PagesLayout";
import "@/styles/globals.css";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <PagesLayout>
          <Component {...pageProps} />
          <Toaster
            toastOptions={{
              style: {
                backgroundColor: "#111111",
                color: "#c0c0c0",
                fontSize: "14px",
              },
            }}
          />
        </PagesLayout>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

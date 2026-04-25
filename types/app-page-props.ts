export type AppPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

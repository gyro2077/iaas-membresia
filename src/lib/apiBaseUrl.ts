export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== "undefined") {
    const onLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (
      envUrl &&
      (envUrl.includes("127.0.0.1") || envUrl.includes("localhost")) &&
      !onLocalDev
    ) {
      return "/api/v1";
    }
  }

  return (
    envUrl ??
    (process.env.NODE_ENV === "production" ? "/api/v1" : "http://127.0.0.1:8000/api/v1")
  );
}

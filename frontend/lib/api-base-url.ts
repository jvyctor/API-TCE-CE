function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "http://localhost:8080";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;

  return withProtocol.replace(/\/$/, "");
}

export function getServerApiBaseUrl() {
  return normalizeBaseUrl(
    process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL
  );
}

export function getPublicApiBaseUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
}

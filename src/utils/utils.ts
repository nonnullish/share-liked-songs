export const api = async ({
  endpoint,
  method = "GET",
  headers,
  body,
  onError,
  onSuccess,
}: {
  endpoint: Request["url"];
  method?: Request["method"];
  headers?: Record<string, string>;
  body?: string;
  onError?: () => void;
  onSuccess?: (data?: any) => void;
}) => {
  const response = await fetch(endpoint, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    onError?.();
    return;
  }

  try {
    const data = await response.json();
    onSuccess?.(data);
    return data;
  } catch (error) {
    onSuccess?.();
    return;
  }
};

export const group = <T>(array: T[], size: number): T[][] => {
  return array.length > size
    ? [array.slice(0, size), ...group(array.slice(size), size)]
    : [array];
};

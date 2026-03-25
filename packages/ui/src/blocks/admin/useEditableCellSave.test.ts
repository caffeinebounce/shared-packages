import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEditableCellSave } from "./useEditableCellSave";

const { logErrorMock, toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  logErrorMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("@caffeinebounce/logger/client", () => ({
  useErrorLoggerSafe: () => ({
    logError: logErrorMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe("useEditableCellSave", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("tracks loading state and runs the success path", async () => {
    const deferred = createDeferred<Response>();
    const fetchMock = vi.mocked(fetch).mockReturnValue(deferred.promise);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useEditableCellSave());

    let savePromise!: Promise<void>;

    act(() => {
      savePromise = result.current.save({
        component: "EditableCell",
        endpoint: "/api/rows",
        rowId: "row-1",
        payload: { name: "Updated" },
        metadata: { columnId: "name" },
        onError,
        onSuccess,
      });
    });

    expect(result.current.isLoading).toBe(true);

    deferred.resolve({ ok: true } as Response);

    await act(async () => {
      await savePromise;
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/rows/row-1", {
      body: JSON.stringify({ name: "Updated" }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("Updated successfully");
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(logErrorMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("logs, toasts, and rolls back on failed updates", async () => {
    const onError = vi.fn();
    const onSuccess = vi.fn();

    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue({ error: "Nope" }),
      ok: false,
    } as unknown as Response);

    const { result } = renderHook(() => useEditableCellSave());

    await act(async () => {
      await result.current.save({
        component: "CompanyNameEditableCell",
        endpoint: "/api/companies",
        rowId: "company-1",
        payload: { name: "Acme", dbaName: null },
        onError,
        onSuccess,
      });
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Nope");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(logErrorMock).toHaveBeenCalledWith(expect.any(Error), {
      action: "handleSave",
      component: "CompanyNameEditableCell",
      metadata: { rowId: "company-1" },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

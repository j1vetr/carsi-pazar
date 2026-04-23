import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

jest.mock("@/components/ErrorFallback", () => {
  const { Text: T } = jest.requireActual("react-native");
  const Fallback = ({ error }: { error: Error }) => <T testID="default-fallback">{error.message}</T>;
  return { ErrorFallback: Fallback };
});

import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ErrorFallbackProps } from "@/components/ErrorFallback";

function Boom(): React.ReactElement {
  throw new Error("kaboom");
}

function Fallback({ error }: ErrorFallbackProps): React.ReactElement {
  return <Text testID="fallback">{`fallback:${error.message}`}</Text>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("hatasız çocuğu gösterir", () => {
    const { getByText } = render(
      <ErrorBoundary FallbackComponent={Fallback}>
        <Text>ok</Text>
      </ErrorBoundary>
    );
    expect(getByText("ok")).toBeTruthy();
  });

  it("alt ağaç hata atınca FallbackComponent'i render eder ve onError çağrılır", () => {
    const onError = jest.fn();
    const { getByTestId } = render(
      <ErrorBoundary FallbackComponent={Fallback} onError={onError}>
        <Boom />
      </ErrorBoundary>
    );
    expect(getByTestId("fallback").props.children).toBe("fallback:kaboom");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

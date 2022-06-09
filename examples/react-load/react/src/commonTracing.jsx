import opentelemetry from "@opentelemetry/api";

export const getTracing = (traceName, spanName) => {
    const tracer = opentelemetry.trace
        .getTracer(traceName)
        .startSpan(spanName);

    return tracer;
}


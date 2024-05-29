import {
    useDataEngine,
    useDataMutation,
    useDataQuery,
} from "@dhis2/app-runtime";
import { useQueryClient, useMutation, useQuery } from "react-query";
import { z } from "zod";
import { useCallback } from "react";

interface UseDataStoreValuesQueryOptions<TResult = unknown> {
    namespace: string;
    key: string;
    // lets the return-type be inferred from validation function
    validate: (data: unknown) => TResult;
}

export const useDataStoreValueWithValidation = <TResult = unknown>(
    options: UseDataStoreValuesQueryOptions<TResult>
) => {
    const engine = useDataEngine();

    const queryKey = {
        resource: "dataStore",
        id: `${options.namespace}/${options.key}`,
    };

    return useQuery({
        queryKey: [queryKey], // queryKeys is an array, so wrap it
        // pass down signal for completeness-sake
        queryFn: ({ queryKey: [query], signal }) =>
            engine.query({ result: query }, { signal }),
        // we could also validate here (inside queryFn), but we may want to abstract away engine.query() call in the future.
        // This also does not work here because we have two identical query-keys (useDataStoreValueReactQuery)
        // and we can't have two query-keys with different data structure
        //.then((data) => options.validate(data.result)),

        select: useCallback(
            (data) => options.validate(data.result),
            [options.validate]
        ),
    });
};

// validation for mutation is not strictly necessary, because if you use the
// same type for updates as you do for fetching (eg. if you need to merge data) ( and types in general) 
// typescript should prevent you from doing something bad.
// It can also easily be done in a callback before calling mutate, so I dont see a need to create
// an abstraction for that inside the mutation hook

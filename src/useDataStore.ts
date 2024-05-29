import {
    useDataEngine,
    useDataMutation,
    useDataQuery,
} from "@dhis2/app-runtime";
import { useQueryClient, useMutation, useQuery } from "react-query";

interface UseDataStoreValuesQueryOptions {
    namespace: string;
    key: string;
}

interface UseMutateDataStoreValueOptions {
    namespace: string;
    key: string;
}

// app-runtime doesn't expose mutation
type Mutation = Parameters<typeof useDataMutation>[0];

/**
 *  !! BEWARE - YOU SHOULD ALWAYS VALIDATE THE DATA WHEN DEALING WITH THE DATA STORE!!
 *    This means using something like zod to parse the data before using it.
 *          - Usually you would want to fallback to some default value in case of failure.
 *     Never assume data from the datastore is the type you expect.
 *
 *   See useDataStoreWithValidation.ts for an example of how to validate data.
 */

const dataStoreQuery = {
    dataStoreData: {
        resource: "dataStore",
        id: (variables: Record<string, string>) =>
            `${variables.namespace}/${variables.key}`,
    },
};

export const useDataStoreQuery = <Data>({
    namespace,
    key,
}: {
    namespace: string;
    key: string;
}) => {
    const query = useDataQuery<Data>(dataStoreQuery, {
        variables: { namespace, key },
    });
    return query;
};

// works ok for simple use-cases and non-generic cases
const todosMutation: Mutation = {
    resource: "dataStore",
    type: "update",
    id: "maintenance/todos",
    data: (variables: { data: unknown }) => variables.data,
};

// no way to type the parameters of the mutation function
// nor the result type
export const useMutateTodos = () => {
    const mutation = useDataMutation(todosMutation);
    return mutation;
};

interface DataStoreMutationVariables extends UseMutateDataStoreValueOptions {
    data?: unknown;
}

const dataStoreMutation = {
    resource: "dataStore",
    type: "update",
    // mutation type is not correct and encorces id to be a string, but it actually works with a callback for dynamic values
    id: (variables: DataStoreMutationVariables) =>
        `${variables.namespace}/${variables.key}`,
    data: (variables: DataStoreMutationVariables) => variables.data,
} as unknown as Mutation; // encorce mutation type since id-type is not correct (HACKY)

export const useMutateDataStoreValue = (
    options: UseMutateDataStoreValueOptions
) => {
    const mutation = useDataMutation(dataStoreMutation, { variables: options });
    return mutation;
};

/* 
    BELOW ARE THE REACT-QUERY VERSIONS
    THIS MAY LOOK MORE COMPLICATED, BUT HANDLES TYPES A LOT BETTER

    Also more powerful to use these directly, because you could eg. do 
        `queryClient.invalidateQueries()` instead of letting the component handle `refetch`.
    
    Overcomes limits and type annoyance of callbacks
    Lets us define better types for the mutation function.
    Lets us optimistcally update the data.
    Lets us handle caching options.


    I have plans to simplify this, by eg. exposing a query-fn that you can just import.
    And simplify engine.query objects from { result: { resource: 'dataStore'} } etc to just { resource: 'dataStore' }.
    Fixing types in app-runtime would also simplify all data-handling A LOT in TS.
*/

export const useDataStoreValueReactQuery = <TResultData>(
    options: UseDataStoreValuesQueryOptions
) => {
    const engine = useDataEngine();
    // we can just use our "Query"-objects as query-keys
    // notice how we wrap { result: query } in queryFn instead of letting react-query have to deal with that
    // the reason for this is that it's much easier to deal with the query-key without the annoying nested object(see how we invalidate below)
    const queryKey = {
        resource: "dataStore",
        id: `${options.namespace}/${options.key}`,
    };
    const query = useQuery({
        queryKey: [queryKey], // queryKeys is an array, so wrap it
        queryFn: ({ queryKey: [query] }) =>
            engine.query({ result: query }) as Promise<{ result: TResultData }>,
        // we select data.result because we dont want the consumer to care about the wrapping object
        select: (data) => data.result,
    });
    return query;
};

export const useMutateDataStoreValueReactQuery = <
    TMutateData = unknown,
    TResultData = unknown
>(
    options: UseMutateDataStoreValueOptions
) => {
    const queryClient = useQueryClient();
    const engine = useDataEngine();

    const mutation = useMutation({
        mutationFn: (data: TMutateData) =>
            engine.mutate({
                resource: "dataStore",
                type: "update",
                id: `${options.namespace}/${options.key}`,
                // we still have to assert data type because
                // engine.mutate is not generic and encorces data to be an object (but it can be any JSON-value)
                data: data as Mutation["data"],
            }) as Promise<TResultData>,
        // now we can let the hook invalidate the data for us, instead of having to pass refetch around
        onSettled: () =>
            queryClient.invalidateQueries([
                {
                    resource: "dataStore",
                    id: `${options.namespace}/${options.key}`,
                },
            ]),

    });
    return mutation;
};

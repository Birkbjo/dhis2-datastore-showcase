import { useCallback } from "react";
import { z } from "zod";
import { useDataStoreValueWithValidation } from "./useDataStoreWithValidation";
import {
    useMutateDataStoreValue,
    useMutateDataStoreValueReactQuery,
} from "./useDataStore";

/** This is an example of how you could make a hook to handle both fetching and updating data from a dataStore.
 * This can free up the component form having to deal with merging of data
 */

const todosSchema = z.object({
    todos: z.array(z.string()),
});

type Todos = z.infer<typeof todosSchema>;

const todosDataStoreOptions = {
    namespace: "maintenance",
    key: "todos",
} as const;

export const useTodosController = () => {
    // notice how we dont have to pass the Todos type here
    // it's inferred from the return-type of "validate", through the zod-schema.parse() function
    const todosQuery = useDataStoreValueWithValidation({
        ...todosDataStoreOptions,
        validate: todosSchema.parse,
    });

    const todosMutation = useMutateDataStoreValueReactQuery<Todos>(
        todosDataStoreOptions
    );

    const addTodo = useCallback(
        async (newTodo: string) => {
            // normally it could be better to do 
            // queryClient.getQueryData() instead of depending on the data from the query.
            // Then this callback would be a stable reference
            // but since we use  "select" we would need to "reselect" eg data.result
            const oldTodos = todosQuery.data?.todos || [];
            return todosMutation.mutateAsync({
                ...todosQuery.data,
                todos: [...oldTodos, newTodo],
            });
        },
        [todosQuery.data, todosMutation.mutateAsync]
    );

    const removeTodo = useCallback(
        async (index: number) => {
            const oldTodos = todosQuery.data?.todos || [];
            const newTodos = oldTodos
                .slice(0, index)
                .concat(oldTodos.slice(index + 1));
            return todosMutation.mutateAsync({
                ...todosQuery.data,
                todos: newTodos,
            });
        },
        [todosQuery.data, todosMutation.mutateAsync]
    );

    return {
        addTodo,
        removeTodo,
        todos: todosQuery.data?.todos,
        // it can be useful to expose the mutation and query for more advanced use-cases
        query: todosQuery,
        mutation: todosMutation,
    };
};

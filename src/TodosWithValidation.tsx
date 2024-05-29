import { InputField, Button } from "@dhis2/ui";
import React, { useState } from "react";
import { useMutateDataStoreValueReactQuery } from "./useDataStore";
import { useDataStoreValueWithValidation } from "./useDataStoreWithValidation";
import { z } from "zod";

const todosSchema = z.object({
    todos: z.array(z.string()),
});

type Todos = z.infer<typeof todosSchema>;

const useTodos = () => {
    // notice how we dont pass the type,
    // but it's inferred from the return-type of validate through the zod-schema
    return useDataStoreValueWithValidation({
        namespace: "maintenance",
        key: "todos",
        validate: todosSchema.parse,
    });
};

export const TodosWithValidation = () => {
    const [newTodo, setNewTodo] = useState<string | undefined>(undefined);
    // now we dont have to care about the wrapping result-object
    const { data, error, status } = useTodos();
    const mutation = useMutateDataStoreValueReactQuery<Todos>({
        namespace: "maintenance",
        key: "todos",
    });

    const updateTodos = async () => {
        if (!newTodo) return;
        const oldTodos = data?.todos || [];

        await mutation.mutateAsync({
            ...data,
            todos: [...oldTodos, newTodo],
        });
        setNewTodo(undefined);
    };

    return (
        <div>
            <h3>React query with validation</h3>
            <span style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                <InputField
                    label="Add a todo"
                    value={newTodo}
                    onChange={({ value }) => setNewTodo(value)}
                />

                <Button disabled={mutation.isLoading} onClick={updateTodos}>
                    Add
                </Button>
            </span>
            <div>
                <h3>Todos</h3>
                <ul>
                    {data?.todos?.map((todo, i) => (
                        <li key={i}>{todo}</li>
                    ))}
                    {
                        // SUPER SIMPLE OPTIMISTIC UPDATES
                        mutation.isLoading && (
                            <li style={{ opacity: 0.5 }}>
                                {
                                    mutation.variables?.todos[
                                        mutation.variables?.todos.length - 1
                                    ]
                                }
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    );
};

import { InputField, Button, IconCross16 } from "@dhis2/ui";
import React, { useState } from "react";
import {
    useDataStoreQuery,
    useDataStoreValueReactQuery,
    useMutateDataStoreValue,
    useMutateDataStoreValueReactQuery,
} from "./useDataStore";

interface Todos {
    todos: string[];
}

interface TodosResult {
    dataStoreData: Todos;
}

export const Todos = () => {
    const [newTodo, setNewTodo] = useState<string | undefined>(undefined);

    const todosOptions = {
        namespace: "maintenance",
        key: "todos",
    } as const;
    const { data, refetch } = useDataStoreQuery<TodosResult>(todosOptions);

    const [mutate] = useMutateDataStoreValue(todosOptions);

    const updateTodos = async () => {
        const oldData = data?.dataStoreData;
        const oldTodos = oldData?.todos || [];
        await mutate({
            // this type is not enforced by mutate
            data: {
                ...oldData,
                todos: [...oldTodos, newTodo],
            },
        });
        refetch();
    };
    return (
        <div>
            <h3>Simple useDataQuery</h3>
            <span style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                <InputField
                    label="Add a todo"
                    value={newTodo}
                    onChange={({ value }) => setNewTodo(value)}
                />

                <Button onClick={updateTodos}>Add</Button>
            </span>
            <div>
                <h3>Todos</h3>
                <ul>
                    {data?.dataStoreData?.todos?.map((todo, i) => (
                        <li key={i}>{todo}</li>
                    ))}
                </ul>
            </div>
            <TodosReactQuery />
        </div>
    );
};

export const TodosReactQuery = () => {
    const [newTodo, setNewTodo] = useState<string | undefined>(undefined);

    const todosOptions = {
        namespace: "maintenance",
        key: "todos",
    };
    // now we dont have to care about the wrapping result-object
    const { data, error, status } =
        useDataStoreValueReactQuery<Todos>(todosOptions);
    const mutation = useMutateDataStoreValueReactQuery<Todos>(todosOptions);

    const updateTodos = async () => {
        if (!newTodo) {
            return;
        }

        const oldTodos = data?.todos || [];

        await mutation.mutateAsync({
            // this is now typed
            // and this let us catch a bug - newTodo can be undefined
            ...data,
            todos: [...oldTodos, newTodo],
        });
        setNewTodo(undefined);
    };

    return (
        <div>
            <h3>React query</h3>
            <span style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                <InputField
                    label="Add a todo"
                    value={newTodo}
                    onChange={({ value }) => setNewTodo(value)}
                />

                <Button onClick={updateTodos}>Add</Button>
            </span>
            <div>
                <h3>Todos</h3>
                <ul>
                    {data?.todos?.map((todo, i) => (
                        <li key={i}>
                            <span
                                style={{
                                    alignItems: "center",
                                    display: "flex",
                                    gap: 8,
                                }}
                                onClick={() =>
                                    mutation.mutate({
                                        ...data,
                                        todos: data.todos
                                            .slice(0, i)
                                            .concat(data.todos.slice(i + 1)),
                                    })
                                }
                            >
                                {todo}
                                <IconCross16 />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

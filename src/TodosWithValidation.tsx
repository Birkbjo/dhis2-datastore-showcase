import { InputField, Button, IconCross16 } from "@dhis2/ui";
import React, { useState } from "react";
import { useTodosController } from "./useTodosController";

export const TodosWithValidation = () => {
    const [newTodo, setNewTodo] = useState<string | undefined>(undefined);
    const { todos, addTodo, removeTodo, mutation, query } =
        useTodosController();

    const updateTodos = async () => {
        if (!newTodo) return;
        await addTodo(newTodo);
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

                <Button
                {/* Can useful to prevent updates while query is loading,
            especially when we handle the merging of the object */}
                    disabled={mutation.isLoading || query.isFetching}
                    onClick={updateTodos}
                >
                    Add
                </Button>
            </span>
            <div>
                <h3>Todos</h3>
                <ul>
                    {todos?.map((todo, i) => (
                        <li key={i}>
                            <span
                                style={{
                                    alignItems: "center",
                                    display: "flex",
                                    gap: 8,
                                }}
                                onClick={() => removeTodo(i)}
                            >
                                {todo}
                                <IconCross16 />
                            </span>
                        </li>
                    ))}
                    {
                        // SUPER SIMPLE OPTIMISTIC UPDATES
                        // adds the last todo when mutation is pending, since we append to end
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

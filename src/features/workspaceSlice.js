import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    status: 'idle',
    error: null,
};

// Async thunks for fetching data
export const fetchWorkspaces = createAsyncThunk(
    'workspace/fetchWorkspaces',
    async () => {
        const response = await fetch('http://localhost:5000/api/workspaces');
        const data = await response.json();
        return data;
    }
);

export const fetchWorkspaceById = createAsyncThunk(
    'workspace/fetchWorkspaceById',
    async (workspaceId) => {
        const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}`);
        const data = await response.json();

        // Removed membersResponse fetch as teamMembersSlice will handle this
        // const membersResponse = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/members`);
        // const membersData = await membersResponse.json();

        const booksResponse = await fetch(`http://localhost:5000/api/books?workspace_id=${workspaceId}`);
        const booksData = await booksResponse.json();

        const booksWithDetails = await Promise.all(booksData.map(async book => {
            const tasksResponse = await fetch(`http://localhost:5000/api/books/${book.id}/tasks`);
            const tasksData = await tasksResponse.json();

            const publishingStagesResponse = await fetch(`http://localhost:5000/api/books/${book.id}/publishingStages`);
            const publishingStagesData = await publishingStagesResponse.json();

            const royaltiesResponse = await fetch(`http://localhost:5000/api/books/${book.id}/royalties`);
            const royaltiesData = await royaltiesResponse.json();

            const launchPlansResponse = await fetch(`http://localhost:5000/api/books/${book.id}/launchPlans`);
            const launchPlansData = await launchPlansResponse.json();

            const tasksWithComments = await Promise.all(tasksData.map(async task => {
                const commentsResponse = await fetch(`http://localhost:5000/api/tasks/${task.id}/comments`);
                const commentsData = await commentsResponse.json();
                return { ...task, comments: commentsData };
            }));

            return {
                ...book,
                tasks: tasksWithComments,
                publishingStages: publishingStagesData,
                royalties: royaltiesData,
                launchPlans: launchPlansData
            };
        }));

        // Ensure members is an empty array or omitted if handled elsewhere
        return { ...data, books: booksWithDetails };
    }
);

export const addAuthorBook = createAsyncThunk(
    'workspace/addAuthorBook',
    async (newBookData, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBookData),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAuthorBook = createAsyncThunk(
    'workspace/updateAuthorBook',
    async (updatedBookData, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/books/${updatedBookData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBookData),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addCommentToTask = createAsyncThunk(
    'workspace/addCommentToTask',
    async ({ bookId, taskId, comment }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(comment),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return { bookId, taskId, comment: data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addRoyalty = createAsyncThunk(
    'workspace/addRoyalty',
    async ({ authorBookId, royalty }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/books/${authorBookId}/royalties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(royalty),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return { authorBookId, royalty: data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTask = createAsyncThunk(
    'workspace/deleteTask',
    async ({ taskId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            return taskId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTask = createAsyncThunk(
    'workspace/updateTask',
    async (updatedTaskData, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${updatedTaskData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePublishingStage = createAsyncThunk(
    'workspace/updatePublishingStage',
    async ({ stageId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/publishing-stages/${stageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateWorkspace = createAsyncThunk(
    'workspace/updateWorkspace',
    async ({ workspaceId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteWorkspace = createAsyncThunk(
    'workspace/deleteWorkspace',
    async (workspaceId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            return workspaceId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaces.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.workspaces = action.payload;
                if (action.payload.length > 0 && !state.currentWorkspace) {
                    state.currentWorkspace = action.payload[0];
                }
            })
            .addCase(fetchWorkspaces.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchWorkspaceById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentWorkspace = action.payload;
                state.workspaces = state.workspaces.map(ws =>
                    ws.id === action.payload.id ? action.payload : ws
                );
            })
            .addCase(fetchWorkspaceById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addAuthorBook.fulfilled, (state, action) => {
                state.workspaces = state.workspaces.map(w =>
                    w.id === action.payload.workspace_id
                        ? { ...w, books: [...(w.books || []), action.payload] }
                        : w
                );
                if (state.currentWorkspace && state.currentWorkspace.id === action.payload.workspace_id) {
                    state.currentWorkspace.books.push(action.payload);
                }
            })
            .addCase(updateAuthorBook.fulfilled, (state, action) => {
                if (state.currentWorkspace) {
                    state.currentWorkspace.books = state.currentWorkspace.books.map(book =>
                        book.id === action.payload.id ? action.payload : book
                    );
                }
                state.workspaces = state.workspaces.map(workspace => {
                    if (workspace.id === action.payload.workspace_id) {
                        return {
                            ...workspace,
                            books: workspace.books.map(book =>
                                book.id === action.payload.id ? action.payload : book
                            ),
                        };
                    }
                    return workspace;
                });
            })
            .addCase(addCommentToTask.fulfilled, (state, action) => {
                const { bookId, taskId, comment } = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.books = state.currentWorkspace.books.map(book => {
                        if (book.id === bookId) {
                            book.tasks = book.tasks.map(task => {
                                if (task.id === taskId) {
                                    return {
                                        ...task,
                                        comments: [...(task.comments || []), comment],
                                    };
                                }
                                return task;
                            });
                        }
                        return book;
                    });
                    state.workspaces = state.workspaces.map(workspace => {
                        if (workspace.id === state.currentWorkspace.id) {
                            return {
                                ...workspace,
                                books: state.currentWorkspace.books,
                            };
                        }
                        return workspace;
                    });
                }
            })
            .addCase(addRoyalty.fulfilled, (state, action) => {
                const { authorBookId, royalty } = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.books = state.currentWorkspace.books.map(book => {
                        if (book.id === authorBookId) {
                            return {
                                ...book,
                                royalties: [...(book.royalties || []), royalty],
                            };
                        }
                        return book;
                    });
                    state.workspaces = state.workspaces.map(workspace => {
                        if (workspace.id === state.currentWorkspace.id) {
                            return {
                                ...workspace,
                                books: state.currentWorkspace.books,
                            };
                        }
                        return workspace;
                    });
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const taskIdToDelete = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.books = state.currentWorkspace.books.map(book => {
                        book.tasks = book.tasks.filter(task => task.id !== taskIdToDelete);
                        return book;
                    });

                    state.workspaces = state.workspaces.map(workspace => {
                        if (workspace.id === state.currentWorkspace.id) {
                            return {
                                ...workspace,
                                books: state.currentWorkspace.books,
                            };
                        }
                        return workspace;
                    });
                }
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.books = state.currentWorkspace.books.map(book => {
                        book.tasks = book.tasks.map(task =>
                            task.id === updatedTask.id ? updatedTask : task
                        );
                        return book;
                    });

                    state.workspaces = state.workspaces.map(workspace => {
                        if (workspace.id === state.currentWorkspace.id) {
                            return {
                                ...workspace,
                                books: state.currentWorkspace.books,
                            };
                        }
                        return workspace;
                    });
                }
            })
            .addCase(updateWorkspace.fulfilled, (state, action) => {
                if (state.currentWorkspace && state.currentWorkspace.id === action.payload.id) {
                    state.currentWorkspace = { ...state.currentWorkspace, ...action.payload };
                }
                state.workspaces = state.workspaces.map(ws =>
                    ws.id === action.payload.id ? { ...ws, ...action.payload } : ws
                );
            })
            .addCase(updatePublishingStage.fulfilled, (state, action) => {
                const updatedStage = action.payload;
                if (state.currentWorkspace) {
                    state.currentWorkspace.books = state.currentWorkspace.books.map(book => {
                        book.publishingStages = book.publishingStages.map(stage =>
                            stage.id === updatedStage.id ? updatedStage : stage
                        );
                        return book;
                    });

                    state.workspaces = state.workspaces.map(workspace => {
                        if (workspace.id === state.currentWorkspace.id) {
                            return {
                                ...workspace,
                                books: state.currentWorkspace.books,
                            };
                        }
                        return workspace;
                    });
                }
            })
            .addCase(deleteWorkspace.fulfilled, (state, action) => {
                const deletedWorkspaceId = action.payload;
                state.workspaces = state.workspaces.filter(ws => ws.id !== deletedWorkspaceId);
                if (state.currentWorkspace && state.currentWorkspace.id === deletedWorkspaceId) {
                    state.currentWorkspace = null; // Clear current workspace if it was deleted
                }
            });
    },
});

export const { setWorkspaces, setCurrentWorkspace } = workspaceSlice.actions;

export const selectAllBooks = createSelector(
    (state) => state.workspace?.currentWorkspace?.books,
    (books) => [...(books || [])]
);

export default workspaceSlice.reducer;

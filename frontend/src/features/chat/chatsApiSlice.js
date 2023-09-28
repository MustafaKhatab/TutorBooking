import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice"

const chatsAdapter = createEntityAdapter({})

const initialState = chatsAdapter.getInitialState()

export const chatsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getChats: builder.query({
            query: (userId) => ({
                url:`chats/${userId}`,
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedChats = responseData.map(chat => {
                    chat.id = chat._id
                    return chat
                });
                return chatsAdapter.setAll(initialState, loadedChats)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Chat', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Chat', id }))
                    ]
                } else return [{ type: 'Chat', id: 'LIST' }]
            }
        }),
        addNewChat: builder.mutation({
            query: initialChatData => ({
                url: '/chats',
                method: 'POST',
                body: {
                    ...initialChatData,
                }
            }),
            invalidatesTags: [
                { type: 'Chat', id: "LIST" }
            ]
        }),
        addNewChatMessage: builder.mutation({
            query: (initialChatData) => ({
              url: '/chats/message',
              method: 'POST',
              body: {
                ...initialChatData,
            }
            }),
            invalidatesTags: [
              { type: 'Chat', id: "LIST" }
            ]
          }),
        addNewMessage: builder.mutation({
            query: ({ chatId, message }) => ({
              url: `chats/${chatId}`,
              method: 'POST',
              body: message,
            }),
            invalidatesTags: [
              { type: 'Chat', id: "LIST" }
            ]
          }),
        updateChat: builder.mutation({
            query: initialChatData => ({
                url: '/chats',
                method: 'PATCH',
                body: {
                    ...initialChatData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Chat', id: arg.id }
            ]
        }),
        deleteChat: builder.mutation({
            query: ({ id }) => ({
                url: `/chats`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Chat', id: arg.id }
            ]
        }),
        addNewBooking:builder.mutation({
            query: initialChatData => ({
                url: '/favorites',
                method: 'POST',
                body: {
                    ...initialChatData,
                }
            }),
        }),
    }),
})

export const {
    useGetChatsQuery,
    useAddNewChatMutation,
    useAddNewMessageMutation,
    useAddNewChatMessageMutation,
    useUpdateChatMutation,
    useDeleteChatMutation,
    useAddNewBookingMutation,
} = chatsApiSlice

// returns the query result object
export const selectChatsResult = chatsApiSlice.endpoints.getChats.select()

// creates memoized selector
const selectChatsData = createSelector(
    selectChatsResult,
    chatsResult => chatsResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllChats,
    selectById: selectChatById,
    selectIds: selectChatIds
    // Pass in a selector that returns the chats slice of state
} = chatsAdapter.getSelectors(state => selectChatsData(state) ?? initialState)
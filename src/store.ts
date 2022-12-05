import { configureStore } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import view from './features/view'
import misc, { miscSaga } from './features/misc'
import cafehub, { cafehubSaga } from '$/features/cafehub'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: {
        view,
        misc,
        cafehub,
    },
    middleware(getDefaultMiddleware) {
        return [
            ...getDefaultMiddleware({
                serializableCheck: {
                    ignoredPaths: [],
                },
            }),
            sagaMiddleware,
        ]
    },
})

sagaMiddleware.run(function* saga() {
    yield all([miscSaga(), cafehubSaga()])
})

export default store

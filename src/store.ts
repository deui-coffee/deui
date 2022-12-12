import { configureStore } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import view from './features/view'
import misc, { miscSaga } from './features/misc'
import cafehub, { cafehubSaga } from '$/features/cafehub'

const sagaMiddleware = createSagaMiddleware({
    onError(e) {
        console.warn('Uncaught error', e)
    },
})

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
                    ignoredActionPaths: ['payload'],
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

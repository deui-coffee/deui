import { configureStore } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import view from './features/view'
import metric from './features/metric'
import machine, { machineSaga } from './features/machine'
import misc, { miscSaga } from './features/misc'
import backend, { backendSaga } from './features/backend'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: {
        view,
        metric,
        machine,
        misc,
        backend,
    },
    middleware(getDefaultMiddleware) {
        return [
            ...getDefaultMiddleware({
                serializableCheck: {
                    ignoredPaths: ['misc.cafehubClient', 'backend.client'],
                },
            }),
            sagaMiddleware,
        ]
    },
})

sagaMiddleware.run(function* saga() {
    yield all([miscSaga(), machineSaga(), backendSaga()])
})

export default store

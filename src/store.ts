import { configureStore } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import view from './features/view'
import metric from './features/metric'
import machine, { machineSaga } from './features/machine'
import misc, { miscSaga } from './features/misc'
import cafehub, { cafehubSaga } from '$/features/cafehub'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: {
        view,
        metric,
        machine,
        misc,
        cafehub,
    },
    middleware(getDefaultMiddleware) {
        return [
            ...getDefaultMiddleware({
                serializableCheck: {
                    ignoredPaths: ['misc.cafehubClient'],
                },
            }),
            sagaMiddleware,
        ]
    },
})

sagaMiddleware.run(function* saga() {
    yield all([miscSaga(), machineSaga(), cafehubSaga()])
})

export default store

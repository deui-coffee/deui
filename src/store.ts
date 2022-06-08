import { configureStore } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import view from './features/view'
import ui, { uiSaga } from './features/ui'
import metric from './features/metric'
import machine, { machineSaga } from './features/machine'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: {
        view,
        ui,
        metric,
        machine,
    },
    middleware(getDefaultMiddleware) {
        return [...getDefaultMiddleware(), sagaMiddleware]
    },
})

sagaMiddleware.run(function* saga() {
    yield all([uiSaga(), machineSaga()])
})

export default store

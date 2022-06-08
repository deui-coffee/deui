import { configureStore } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: {},
})

sagaMiddleware.run(function* saga() {
    yield all([])
})

export default store

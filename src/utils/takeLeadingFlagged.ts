import { MiscAction } from '$/features/misc'
import { Flagged } from '$/types'
import { Action, ActionCreatorWithPayload, PayloadAction } from '@reduxjs/toolkit'
import { Task } from 'redux-saga'
import { ActionPattern, call, cancel, fork, put, take } from 'redux-saga/effects'

interface Memo {
    [key: string]: Task
}

interface Options {
    cancellationPattern?: ActionPattern<Action<unknown>>
}

export default function takeLeadingFlagged<T extends Flagged>(
    pattern: ActionCreatorWithPayload<T>,
    worker: (action: PayloadAction<T>) => void,
    { cancellationPattern }: Options = {}
) {
    return fork(function* () {
        const memo: Memo = {}

        while (true) {
            const action: PayloadAction<T> = yield take(pattern)

            const { flag: key } = action.payload

            if (memo[key]) {
                // Skip ongoing saga.
                continue
            }

            yield fork(function* () {
                memo[key] = yield fork(function* () {
                    try {
                        yield put(MiscAction.setFlag({ key, value: true }))

                        yield call(worker, action)
                    } finally {
                        delete memo[key]

                        yield put(MiscAction.setFlag({ key, value: false }))
                    }
                })

                if (cancellationPattern && memo[key]) {
                    yield take(cancellationPattern)

                    yield cancel(memo[key])
                }
            })
        }
    })
}

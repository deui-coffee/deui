import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { GlobalStyles } from 'twin.macro'
import App from './App'
import './fonts/LabGrotesque.css'
import './index.css'
import { Provider } from 'react-redux'
import store from './store'

ReactDOM.render(
    <React.StrictMode>
        <GlobalStyles />
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
)

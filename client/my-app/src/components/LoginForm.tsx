import React, {FC, useContext, useState} from 'react';
import {Context} from "../index"

const LoginForm: FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const {store} = useContext(Context);

    return (
        <div className = 'window'>
            <div className="window_headr">
                <div className="window_headr_logo"><img src={`${process.env.PUBLIC_URL}/messenger (3).png`} alt="Messenger" /></div>
                <div className="window_headr_h">
                    <h1>Messanger</h1>
                    <p>Войдите в аккаунт или зарегистрируйтесь</p>
                </div>
            </div>
            <div className="window_input">
            <input 
                onChange={e => setEmail(e.target.value)}
                value={email}
                type='email' 
                placeholder='Email'
                className = 'Email'/>
            <input 
                onChange={e => setPassword(e.target.value)}
                value={password}
                type='password' 
                placeholder='Пароль'
                className = 'Password'/>
            </div>
            <a href='#' className = 'a'>Забыли пароль?</a>
            <div className = "button">
                <button onClick={() => store.login(email, password)}>Логин</button>
                <button onClick={() => store.registration(email, password)}>Регистрация</button>
            </div>
        </div>
    )
}

export default LoginForm
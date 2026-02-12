/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import Cookies from "js-cookie";
import { useState } from "react";

const useCookies = (name) => {
    const [cookies, setCookies] = useState(() => {
        const value = Cookies.get(name)
        return value ? JSON.parse(value) : []
    })

    const setCookie = (newContent) => {
        const newCookies = [...cookies, newContent]
        Cookies.set(name, JSON.stringify(newCookies), { expires: 7 })
        setCookies(newCookies)
    }

    const clearCookie = () => {
        Cookies.remove(name);
        setCookies([])
    }

    const replaceCookie = (newContent) => {
        Cookies.set(name, JSON.stringify(newContent), { expires: 7 })
        setCookies(newContent)
    }

    const getCookie = () => {
        const value = Cookies.get(name)
        return value ? JSON.parse(value) : [null]
    }

    return {
        cookies: cookies,
        setCookie: setCookie,
        clearCookie: clearCookie,
        replaceCookie: replaceCookie,
        getCookie: getCookie
    };
}

export default useCookies;
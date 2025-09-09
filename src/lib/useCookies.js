import Cookies from "js-cookie";
import { useState } from "react";

const useCookies = (name) => {
    const [cookies, setCookies] = useState(() => {
        try {
            const value = Cookies.get(name)
            return value ? JSON.parse(value) : []
        } catch (error) {
            console.error('Error parsing initial cookie:', error);
            return []
        }
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
        try {
            const value = Cookies.get(name)
            return value ? JSON.parse(value) : []
        } catch (error) {
            console.error('Error parsing cookie:', error);
            return []
        }
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
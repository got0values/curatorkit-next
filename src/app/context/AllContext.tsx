'use client'

import {useState, useEffect, createContext, ReactNode} from 'react';

export interface AllContextProps {
    tokens: number;
    setTokens: (value: number) => void;
}
interface AllContextProviderProps {
    children: ReactNode;
}

export const AllContext = createContext<AllContextProps | undefined>(undefined);

export function AllContextProvider({children}: AllContextProviderProps) {

    const [tokens,setTokens] = useState(0);

    useEffect(()=>{
    },[])

    return (
        <AllContext.Provider value={{tokens, setTokens}}>
            {children}
        </AllContext.Provider>
    )
}
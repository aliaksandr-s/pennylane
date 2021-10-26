import * as React from "react";
import OpenAPIClientAxios from "openapi-client-axios";
import definition from "./gen/schema.json";

const ApiContext = React.createContext({
    client: undefined,
});

export const ApiProvider = ({ url, token, children, }) => {
    const apiRef = React.useRef(new OpenAPIClientAxios({
        /* @ts-ignore */
        definition,
        withServer: { url },
        axiosConfigDefaults: {
            headers: {
                common: {
                    "X-SESSION": token,
                },
            },
        },
    }));
    const clientRef = React.useRef(apiRef.current.initSync());
    return (<ApiContext.Provider value={{ client: clientRef.current }}>
        {children}
    </ApiContext.Provider>);
};

export const useApi = () => {
    const { client } = React.useContext(ApiContext);
    if (!client) {
        throw new Error("A client API must be defined");
    }
    return client;
};

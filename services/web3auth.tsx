import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTER_TYPE,
} from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import type { LOGIN_PROVIDER_TYPE } from "@toruslabs/openlogin";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getWalletProvider, IWalletProvider } from "./walletProvider";

export const clientId = "BCH4t_XxCk7UVxoxWUdcTRB4GAyArl9r0F-BG81r47SWt1pxG0Bl5ojjqf2h6JbyKWOBgRlqi5vi9liX09e2JLY";
export const web3AuthNetwork = "testnet";
export const chainNamespace = "eip155";
export const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x7E4",
  rpcTarget: "http://localhost:3000/rpc", // see next.config.js for proxy rewrite
  blockExplorer: "https://explorer.roninchain.com"
}

export interface IWeb3AuthContext {
  web3Auth: Web3AuthNoModal | null;
  provider: IWalletProvider | null;
  isLoading: boolean;
  user: unknown;
  login: (
    adapter: WALLET_ADAPTER_TYPE,
    provider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  getUserInfo: () => Promise<any>;
  signMessage: () => Promise<any>;
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<any>;
  signTransaction: () => Promise<void>;
  signAndSendTransaction: () => Promise<void>;
}

export const Web3AuthContext = createContext<IWeb3AuthContext>({
  web3Auth: null,
  provider: null,
  isLoading: false,
  user: null,
  setIsLoading: (loading: boolean) => { },
  login: async (
    adapter: WALLET_ADAPTER_TYPE,
    provider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => { },
  logout: async () => { },
  getUserInfo: async () => { },
  signMessage: async () => { },
  getAccounts: async () => { },
  getBalance: async () => { },
  signTransaction: async () => { },
  signAndSendTransaction: async () => { },
});

export function useWeb3Auth(): IWeb3AuthContext {
  return useContext(Web3AuthContext);
}

interface IWeb3AuthState {
  children?: React.ReactNode;
}
interface IWeb3AuthProps {
  children?: ReactNode;
}

export const Web3AuthProvider: FunctionComponent<IWeb3AuthState> = ({
  children
}: IWeb3AuthProps) => {
  const [web3Auth, setWeb3Auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IWalletProvider | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setWalletProvider = useCallback(
    (web3authProvider: SafeEventEmitterProvider) => {
      const walletProvider = getWalletProvider(
        web3authProvider,
        uiConsole
      );
      setProvider(walletProvider);
    },
    []
  );

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthNoModal) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        setUser(data);
        setWalletProvider(web3auth.provider!);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    async function init() {
      try {
        setIsLoading(true);
        // get your client id from https://dashboard.web3auth.io by registering a plug and play application.

        const web3AuthInstance = new Web3AuthNoModal({
          chainConfig,
          clientId,
          web3AuthNetwork,
        });
        subscribeAuthEvents(web3AuthInstance);
        const adapter = new OpenloginAdapter({
          adapterSettings: {
            clientId,
            uxMode: "redirect",
            loginConfig: {
              jwt: {
                name: "Axie Sniper",
                verifier: "axie-sniper-firebase-verifier",
                typeOfLogin: "jwt",
                clientId
              },
            },
          },
        });
        web3AuthInstance.configureAdapter(adapter);

        await web3AuthInstance.init();
        setWeb3Auth(web3AuthInstance);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [setWalletProvider]);

  const login = async (
    adapter: WALLET_ADAPTER_TYPE,
    loginProvider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => {
    try {
      setIsLoading(true);
      if (!web3Auth) {
        console.log("web3auth not initialized yet");
        uiConsole("web3auth not initialized yet");
        return;
      }
      const localProvider = await web3Auth.connectTo(adapter, {
        relogin: true,
        loginProvider,
        extraLoginOptions: {
          id_token: jwtToken,
          domain: process.env.REACT_APP_DOMAIN || "http://localhost:3000",
          verifierIdField: "sub",
        },
      });
      setWalletProvider(localProvider!);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    setProvider(null);
  };

  const getUserInfo = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3Auth.getUserInfo();
    uiConsole(user);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.getAccounts();
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.getBalance();
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.signMessage();
  };

  const signTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.signTransaction();
  };

  const signAndSendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.signAndSendTransaction();
  };

  const uiConsole = (...args: unknown[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  const contextProvider = {
    web3Auth,
    provider,
    user,
    isLoading,
    setIsLoading,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    signTransaction,
    signAndSendTransaction,
  };
  return (
    <Web3AuthContext.Provider value={contextProvider}>
      {children}
    </Web3AuthContext.Provider>
  );
};